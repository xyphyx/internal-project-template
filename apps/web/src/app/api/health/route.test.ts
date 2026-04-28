import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MockResponse = { body: Record<string, string>; status: number };

// Minimal mock so tests run outside the Next.js runtime
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }): MockResponse => ({
      body: body as Record<string, string>,
      status: init?.status ?? 200,
    }),
  },
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns status ok with all required fields", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "1.2.3");

    const { GET } = await import("./route");
    const res = GET() as unknown as MockResponse;

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.version).toBe("1.2.3");
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("defaults version to 'unknown' when NEXT_PUBLIC_APP_VERSION is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "");

    const { GET } = await import("./route");
    const res = GET() as unknown as MockResponse;

    expect(res.body.version).toBe("unknown");
  });

  it("reflects NODE_ENV in the environment field", async () => {
    const { GET } = await import("./route");
    const res = GET() as unknown as MockResponse;

    expect(typeof res.body.environment).toBe("string");
  });

  it("returns a valid ISO 8601 timestamp", async () => {
    const { GET } = await import("./route");
    const res = GET() as unknown as MockResponse;

    const ts = res.body.timestamp ?? "";
    const date = new Date(ts);
    expect(date.toISOString()).toBe(ts);
  });
});
