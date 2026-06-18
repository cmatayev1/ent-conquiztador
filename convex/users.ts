import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called store without authentication");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", function (q) {
        return q.eq("clerkId", identity.subject);
      })
      .unique();

    if (existing !== null) {
      if (existing.name !== identity.name || existing.email !== identity.email) {
        await ctx.db.patch(existing._id, {
          name: identity.name,
          email: identity.email,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name,
      email: identity.email,
      gamesPlayed: 0,
      gamesWon: 0,
      preferredLang: "ru",
      createdAt: Date.now(),
    });
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", function (q) {
        return q.eq("clerkId", identity.subject);
      })
      .unique();
  },
});