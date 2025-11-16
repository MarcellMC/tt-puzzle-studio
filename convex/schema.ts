import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  puzzles: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    pieces: v.array(
      v.object({
        id: v.string(),
        path: v.string(), // SVG path data for the piece shape
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        correctX: v.number(), // Correct position for snapping
        correctY: v.number(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("created", ["createdAt"]),
});
