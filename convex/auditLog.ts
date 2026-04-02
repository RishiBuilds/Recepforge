import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("auditLog")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .order("desc")
      .take(50);
    return logs.filter((l) => l.organizationId === args.organizationId);
  },
});
