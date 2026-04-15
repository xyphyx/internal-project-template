import { beforeEach, describe, expect, it, vi } from "vitest";

// Expose the handler directly so we can test business logic with a mock ctx.
vi.mock("../_generated/server", () => ({
  internalMutation: (def: { handler: (...args: unknown[]) => unknown }) => def,
  query: (def: { handler: (...args: unknown[]) => unknown }) => def,
}));

vi.mock("convex/values", () => ({
  v: new Proxy({}, { get: () => () => null }),
}));

import { deleteByClerkId, upsert } from "./users";

// After mocking, the wrappers return { args, handler } instead of a Convex ref.
const upsertHandler = (
  upsert as unknown as { handler: (ctx: unknown, args: unknown) => Promise<void> }
).handler;
const deleteHandler = (
  deleteByClerkId as unknown as { handler: (ctx: unknown, args: unknown) => Promise<void> }
).handler;

type MockCtx = {
  db: {
    query: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    _unique: ReturnType<typeof vi.fn>;
  };
};

function makeCtx(existingUser: Record<string, unknown> | null = null): MockCtx {
  const unique = vi.fn().mockResolvedValue(existingUser);
  const withIndex = vi.fn(() => ({ unique }));
  const query = vi.fn(() => ({ withIndex }));
  const insert = vi.fn().mockResolvedValue("new_id");
  const patch = vi.fn().mockResolvedValue(null);
  const del = vi.fn().mockResolvedValue(null);
  return { db: { query, insert, patch, delete: del, _unique: unique } };
}

describe("users.upsert", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts a new user when none exists", async () => {
    const ctx = makeCtx(null);
    await upsertHandler(ctx, { clerkId: "clerk_1", email: "a@b.com" });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "users",
      expect.objectContaining({
        clerkId: "clerk_1",
        email: "a@b.com",
        createdAt: expect.any(Number),
      })
    );
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("patches an existing user", async () => {
    const existing = { _id: "id_1", clerkId: "clerk_1", email: "old@b.com" };
    const ctx = makeCtx(existing);
    await upsertHandler(ctx, { clerkId: "clerk_1", email: "new@b.com", name: "Alice" });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "id_1",
      expect.objectContaining({ email: "new@b.com", name: "Alice" })
    );
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("patches with optional imageUrl when provided", async () => {
    const existing = { _id: "id_1", clerkId: "clerk_1", email: "a@b.com" };
    const ctx = makeCtx(existing);
    await upsertHandler(ctx, {
      clerkId: "clerk_1",
      email: "a@b.com",
      imageUrl: "https://img.example.com/1",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "id_1",
      expect.objectContaining({ imageUrl: "https://img.example.com/1" })
    );
  });
});

describe("users.deleteByClerkId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the user when found", async () => {
    const user = { _id: "id_1", clerkId: "clerk_1" };
    const ctx = makeCtx(user);
    await deleteHandler(ctx, { clerkId: "clerk_1" });
    expect(ctx.db.delete).toHaveBeenCalledWith("id_1");
  });

  it("does nothing when user not found", async () => {
    const ctx = makeCtx(null);
    await deleteHandler(ctx, { clerkId: "ghost_id" });
    expect(ctx.db.delete).not.toHaveBeenCalled();
  });
});
