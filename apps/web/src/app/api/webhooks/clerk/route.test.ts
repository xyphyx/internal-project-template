import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
  env: {
    CLERK_WEBHOOK_SECRET: "whsec_test",
    CONVEX_DEPLOY_KEY: "prod:test_deploy_key",
    NEXT_PUBLIC_CONVEX_URL: "https://convex.test",
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    })),
  },
}));

vi.mock("svix", () => ({
  // Arrow functions cannot be used as constructors (new Webhook(...)). Use a class mock instead.
  Webhook: class {
    verify = mockVerify;
  },
}));

vi.mock("@convex/_generated/api", () => ({
  internal: {
    functions: {
      users: {
        upsert: "functions/users:upsert",
        deleteByClerkId: "functions/users:deleteByClerkId",
      },
    },
  },
}));

vi.mock("convex/server", () => ({
  getFunctionName: (ref: string) => ref,
}));

// Defined after vi.mock to avoid hoisting issues — referenced via closure in the svix mock factory.
const mockVerify = vi.fn();

import { headers } from "next/headers";
import { POST } from "./route";

function makeRequest(body: string): Request {
  return { text: vi.fn().mockResolvedValue(body) } as unknown as Request;
}

function stubHeaders(map: Record<string, string | null>) {
  (headers as ReturnType<typeof vi.fn>).mockResolvedValue({
    get: (key: string) => map[key] ?? null,
  });
}

const fullHeaders = {
  "svix-id": "msg_test_id",
  "svix-timestamp": "1234567890",
  "svix-signature": "v1,sig_test",
};

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "success" }),
        text: async () => "",
      })
    );
  });

  describe("header validation", () => {
    it("returns 400 when all svix headers are missing", async () => {
      stubHeaders({ "svix-id": null, "svix-timestamp": null, "svix-signature": null });
      const res = (await POST(makeRequest("{}"))) as { status: number };
      expect(res.status).toBe(400);
    });

    it("returns 400 when only svix-id is missing", async () => {
      stubHeaders({ "svix-id": null, "svix-timestamp": "ts", "svix-signature": "sig" });
      const res = (await POST(makeRequest("{}"))) as { status: number };
      expect(res.status).toBe(400);
    });
  });

  describe("signature verification", () => {
    it("returns 400 when Webhook.verify throws", async () => {
      stubHeaders(fullHeaders);
      mockVerify.mockImplementation(() => {
        throw new Error("invalid signature");
      });
      const res = (await POST(makeRequest("{}"))) as { status: number };
      expect(res.status).toBe(400);
    });
  });

  describe("event handling", () => {
    it("calls upsert mutation for user.created and returns 200", async () => {
      const event = {
        type: "user.created",
        data: {
          id: "clerk_abc",
          email_addresses: [{ email_address: "alice@example.com" }],
          first_name: "Alice",
          last_name: "Smith",
          image_url: "https://img.example.com/1.jpg",
        },
      };
      stubHeaders(fullHeaders);
      mockVerify.mockReturnValue(event);

      const res = (await POST(makeRequest(JSON.stringify(event)))) as {
        status: number;
        body: unknown;
      };
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: true });

      const fetchMock = fetch as ReturnType<typeof vi.fn>;
      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain("/api/mutation");
      const body = JSON.parse(opts.body as string);
      expect(body.path).toContain("upsert");
      expect(body.args[0]).toMatchObject({
        clerkId: "clerk_abc",
        email: "alice@example.com",
        name: "Alice Smith",
      });
    });

    it("calls upsert mutation for user.updated", async () => {
      const event = {
        type: "user.updated",
        data: { id: "clerk_abc", email_addresses: [{ email_address: "bob@example.com" }] },
      };
      stubHeaders(fullHeaders);
      mockVerify.mockReturnValue(event);

      const res = (await POST(makeRequest(JSON.stringify(event)))) as { status: number };
      expect(res.status).toBe(200);

      const fetchMock = fetch as ReturnType<typeof vi.fn>;
      const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string);
      expect(body.path).toContain("upsert");
    });

    it("calls deleteByClerkId mutation for user.deleted", async () => {
      const event = { type: "user.deleted", data: { id: "clerk_abc" } };
      stubHeaders(fullHeaders);
      mockVerify.mockReturnValue(event);

      const res = (await POST(makeRequest(JSON.stringify(event)))) as { status: number };
      expect(res.status).toBe(200);

      const fetchMock = fetch as ReturnType<typeof vi.fn>;
      expect(fetchMock).toHaveBeenCalledOnce();
      const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string);
      expect(body.path).toContain("deleteByClerkId");
      expect(body.args[0]).toMatchObject({ clerkId: "clerk_abc" });
    });

    it("returns 200 without calling fetch for unsupported event types", async () => {
      const event = { type: "org.created", data: { id: "org_1" } };
      stubHeaders(fullHeaders);
      mockVerify.mockReturnValue(event);

      const res = (await POST(makeRequest(JSON.stringify(event)))) as { status: number };
      expect(res.status).toBe(200);
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
