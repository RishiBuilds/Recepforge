import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    appointmentId: v.id("appointments"),
    patientId: v.id("patients"),
    doctorId: v.string(),
    organizationId: v.string(),
    content: v.string(),
    template: v.optional(v.string()),
    isDraft: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("clinicalNotes", {
      appointmentId: args.appointmentId,
      patientId: args.patientId,
      doctorId: args.doctorId,
      organizationId: args.organizationId,
      content: args.content,
      template: args.template,
      isDraft: args.isDraft,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clinicalNotes"),
    content: v.string(),
    isDraft: v.boolean(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Note not found");
    }
    await ctx.db.patch(args.id, {
      content: args.content,
      isDraft: args.isDraft,
      updatedAt: Date.now(),
    });
  },
});

export const getByAppointment = query({
  args: {
    appointmentId: v.id("appointments"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("clinicalNotes")
      .withIndex("by_appointment", (q) =>
        q.eq("appointmentId", args.appointmentId)
      )
      .collect();
    return notes.filter((n) => n.organizationId === args.organizationId);
  },
});

export const getByPatient = query({
  args: {
    patientId: v.id("patients"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("clinicalNotes")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
    return notes.filter((n) => n.organizationId === args.organizationId);
  },
});
