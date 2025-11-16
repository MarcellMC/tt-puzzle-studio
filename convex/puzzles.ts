import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    pieces: v.array(
      v.object({
        id: v.string(),
        path: v.string(),
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        correctX: v.number(),
        correctY: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const puzzleId = await ctx.db.insert("puzzles", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return puzzleId;
  },
});

export const get = query({
  args: { id: v.id("puzzles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("puzzles")
      .order("desc")
      .take(100);
  },
});

export const update = mutation({
  args: {
    id: v.id("puzzles"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    pieces: v.optional(
      v.array(
        v.object({
          id: v.string(),
          path: v.string(),
          x: v.number(),
          y: v.number(),
          width: v.number(),
          height: v.number(),
          correctX: v.number(),
          correctY: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
