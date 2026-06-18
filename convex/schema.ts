import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    gamesPlayed: v.number(),
    gamesWon: v.number(),
    preferredLang: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
});