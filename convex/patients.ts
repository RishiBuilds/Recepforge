import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    organizationId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const patientId = await ctx.db.insert("patients", {
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      phone: args.phone,
      email: args.email,
      address: args.address,
      emergencyContactName: args.emergencyContactName,
      emergencyContactPhone: args.emergencyContactPhone,
      insuranceProvider: args.insuranceProvider,
      insurancePolicyNumber: args.insurancePolicyNumber,
      status: "active",
      organizationId: args.organizationId,
      createdBy: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLog", {
      action: "patient.created",
      entityType: "patient",
      entityId: patientId,
      userId: args.userId,
      organizationId: args.organizationId,
      details: JSON.stringify({ firstName: args.firstName, lastName: args.lastName }),
      timestamp: now,
    });

    return patientId;
  },
});

export const update = mutation({
  args: {
    id: v.id("patients"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    organizationId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, organizationId, userId, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.organizationId !== organizationId) {
      throw new Error("Patient not found");
    }

    const validUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        validUpdates[key] = value;
      }
    }
    validUpdates.updatedAt = Date.now();

    await ctx.db.patch(id, validUpdates);

    await ctx.db.insert("auditLog", {
      action: "patient.updated",
      entityType: "patient",
      entityId: id,
      userId,
      organizationId,
      details: JSON.stringify(validUpdates),
      timestamp: Date.now(),
    });
  },
});

export const list = query({
  args: {
    organizationId: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("patients")
        .withIndex("by_org_status", (q) =>
          q.eq("organizationId", args.organizationId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("patients")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id("patients"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.id);
    if (!patient || patient.organizationId !== args.organizationId) {
      return null;
    }
    return patient;
  },
});

export const search = query({
  args: {
    organizationId: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return await ctx.db
        .query("patients")
        .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
        .order("desc")
        .take(20);
    }

    const results = await ctx.db
      .query("patients")
      .withSearchIndex("search_name", (q) =>
        q.search("firstName", args.searchTerm).eq("organizationId", args.organizationId)
      )
      .take(20);

    return results;
  },
});
