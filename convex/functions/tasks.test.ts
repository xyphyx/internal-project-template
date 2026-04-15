import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../_generated/server", () => ({
  mutation: (def: { handler: (...args: unknown[]) => unknown }) => def,
  query: (def: { handler: (...args: unknown[]) => unknown }) => def,
}));

vi.mock("convex/values", () => ({
  v: new Proxy({}, { get: () => () => null }),
}));

// vi.mock factories are hoisted before variable declarations; use vi.hoisted() so the
// reference is available when the factory runs.
const mockGetCurrentUser = vi.hoisted(() => vi.fn());
vi.mock("./users", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

import { create, list, remove, toggle } from "./tasks";

type Handler<T = unknown> = (ctx: unknown, args: unknown) => Promise<T>;

const listHandler = (list as unknown as { handler: Handler<unknown[]> }).handler;
const createHandler = (create as unknown as { handler: Handler<string> }).handler;
const toggleHandler = (toggle as unknown as { handler: Handler<void> }).handler;
const removeHandler = (remove as unknown as { handler: Handler<void> }).handler;

const mockUser = { _id: "user_id", clerkId: "clerk_1", email: "a@b.com" };

type MockDb = {
  query: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

function makeCtx(tasks: unknown[] = []): { db: MockDb } {
  const collect = vi.fn().mockResolvedValue(tasks);
  const order = vi.fn(() => ({ collect }));
  const withIndex = vi.fn(() => ({ order }));
  const query = vi.fn(() => ({ withIndex }));
  const get = vi.fn();
  const insert = vi.fn().mockResolvedValue("new_task_id");
  const patch = vi.fn().mockResolvedValue(null);
  const del = vi.fn().mockResolvedValue(null);
  return { db: { query, get, insert, patch, delete: del } };
}

describe("tasks.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty array when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const ctx = makeCtx();
    const result = await listHandler(ctx, {});
    expect(result).toEqual([]);
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("returns tasks for authenticated user", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const tasks = [{ _id: "t1", text: "Task 1", userId: "clerk_1" }];
    const ctx = makeCtx(tasks);
    const result = await listHandler(ctx, {});
    expect(result).toEqual(tasks);
    expect(ctx.db.query).toHaveBeenCalledWith("tasks");
  });
});

describe("tasks.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const ctx = makeCtx();
    await expect(createHandler(ctx, { text: "New task" })).rejects.toThrow("Unauthenticated");
  });

  it("inserts task for authenticated user and returns its id", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const ctx = makeCtx();
    const id = await createHandler(ctx, { text: "New task" });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "tasks",
      expect.objectContaining({
        text: "New task",
        isCompleted: false,
        userId: "clerk_1",
        createdAt: expect.any(Number),
      })
    );
    expect(id).toBe("new_task_id");
  });
});

describe("tasks.toggle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const ctx = makeCtx();
    await expect(toggleHandler(ctx, { id: "t1" })).rejects.toThrow("Unauthenticated");
  });

  it("throws when task not found", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const ctx = makeCtx();
    ctx.db.get = vi.fn().mockResolvedValue(null);
    await expect(toggleHandler(ctx, { id: "t1" })).rejects.toThrow(
      "Task not found or access denied"
    );
  });

  it("throws when task belongs to a different user", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const ctx = makeCtx();
    ctx.db.get = vi.fn().mockResolvedValue({ _id: "t1", userId: "other_user", isCompleted: false });
    await expect(toggleHandler(ctx, { id: "t1" })).rejects.toThrow(
      "Task not found or access denied"
    );
  });

  it("toggles isCompleted from false to true", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const ctx = makeCtx();
    ctx.db.get = vi.fn().mockResolvedValue({ _id: "t1", userId: "clerk_1", isCompleted: false });
    await toggleHandler(ctx, { id: "t1" });
    expect(ctx.db.patch).toHaveBeenCalledWith("t1", { isCompleted: true });
  });

  it("toggles isCompleted from true to false", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const ctx = makeCtx();
    ctx.db.get = vi.fn().mockResolvedValue({ _id: "t1", userId: "clerk_1", isCompleted: true });
    await toggleHandler(ctx, { id: "t1" });
    expect(ctx.db.patch).toHaveBeenCalledWith("t1", { isCompleted: false });
  });
});

describe("tasks.remove", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const ctx = makeCtx();
    await expect(removeHandler(ctx, { id: "t1" })).rejects.toThrow("Unauthenticated");
  });

  it("throws when task not found", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const ctx = makeCtx();
    ctx.db.get = vi.fn().mockResolvedValue(null);
    await expect(removeHandler(ctx, { id: "t1" })).rejects.toThrow(
      "Task not found or access denied"
    );
  });

  it("throws when task belongs to a different user", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const ctx = makeCtx();
    ctx.db.get = vi.fn().mockResolvedValue({ _id: "t1", userId: "other_user" });
    await expect(removeHandler(ctx, { id: "t1" })).rejects.toThrow(
      "Task not found or access denied"
    );
  });

  it("deletes the task when authorized", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    const ctx = makeCtx();
    ctx.db.get = vi.fn().mockResolvedValue({ _id: "t1", userId: "clerk_1" });
    await removeHandler(ctx, { id: "t1" });
    expect(ctx.db.delete).toHaveBeenCalledWith("t1");
  });
});
