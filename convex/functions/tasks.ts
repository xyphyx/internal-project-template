import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUser } from "./users";

/**
 * List all tasks for the authenticated user.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user.clerkId))
      .order("desc")
      .collect();
  },
});

/**
 * Create a new task.
 */
export const create = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthenticated");

    return ctx.db.insert("tasks", {
      text: args.text,
      isCompleted: false,
      userId: user.clerkId,
      createdAt: Date.now(),
    });
  },
});

/**
 * Toggle task completion.
 */
export const toggle = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== user.clerkId) {
      throw new Error("Task not found or access denied");
    }

    await ctx.db.patch(args.id, { isCompleted: !task.isCompleted });
  },
});

/**
 * Delete a task.
 */
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== user.clerkId) {
      throw new Error("Task not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});
