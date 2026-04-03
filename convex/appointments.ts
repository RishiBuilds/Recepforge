import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const statusValues = v.union(
  v.literal("scheduled"),
  v.literal("confirmed"),
  v.literal("waiting"),
  v.literal("in-progress"),
  v.literal("completed"),
  v.literal("cancelled")
);

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.string(),
    doctorName: v.string(),
    organizationId: v.string(),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    reason: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Conflict detection: check if doctor has overlapping appointment
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_doctor_date", (q) =>
        q.eq("doctorId", args.doctorId).eq("date", args.date)
      )
      .collect();

    const hasConflict = existing.some((apt) => {
      if (apt.status === "cancelled") return false;
      return apt.startTime < args.endTime && apt.endTime > args.startTime;
    });

    if (hasConflict) {
      throw new Error("Doctor has a conflicting appointment at this time");
    }

    const now = Date.now();
    const appointmentId = await ctx.db.insert("appointments", {
      patientId: args.patientId,
      doctorId: args.doctorId,
      doctorName: args.doctorName,
      organizationId: args.organizationId,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      status: "scheduled",
      reason: args.reason,
      createdBy: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditLog", {
      action: "appointment.created",
      entityType: "appointment",
      entityId: appointmentId,
      userId: args.userId,
      organizationId: args.organizationId,
      details: JSON.stringify({
        patientId: args.patientId,
        doctorName: args.doctorName,
        date: args.date,
        startTime: args.startTime,
      }),
      timestamp: now,
    });

    const patient = await ctx.db.get(args.patientId);
    if (patient) {
      await ctx.scheduler.runAfter(0, internal.notifications.create, {
        recipientUserId: args.userId,
        organizationId: args.organizationId,
        type: "appointment_created",
        title: "New Appointment Scheduled",
        message: `Appointment for ${patient.firstName} ${patient.lastName} with Dr. ${args.doctorName} on ${args.date} at ${args.startTime}.`,
        entityType: "appointment",
        entityId: appointmentId,
        patientEmail: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        emailSubject: `Appointment Confirmation - ${args.date} at ${args.startTime}`,
      });
    }

    return appointmentId;
  },
});

export const update = mutation({
  args: {
    id: v.id("appointments"),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    reason: v.optional(v.string()),
    doctorId: v.optional(v.string()),
    doctorName: v.optional(v.string()),
    organizationId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, organizationId, userId, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.organizationId !== organizationId) {
      throw new Error("Appointment not found");
    }

    // If rescheduling, check for conflicts
    const newDate = updates.date || existing.date;
    const newStart = updates.startTime || existing.startTime;
    const newEnd = updates.endTime || existing.endTime;
    const newDoctorId = updates.doctorId || existing.doctorId;

    if (updates.date || updates.startTime || updates.endTime || updates.doctorId) {
      const doctorAppts = await ctx.db
        .query("appointments")
        .withIndex("by_doctor_date", (q) =>
          q.eq("doctorId", newDoctorId).eq("date", newDate)
        )
        .collect();

      const hasConflict = doctorAppts.some((apt) => {
        if (apt._id === id || apt.status === "cancelled") return false;
        return apt.startTime < newEnd && apt.endTime > newStart;
      });

      if (hasConflict) {
        throw new Error("Doctor has a conflicting appointment at this time");
      }
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
      action: "appointment.updated",
      entityType: "appointment",
      entityId: id,
      userId,
      organizationId,
      details: JSON.stringify(validUpdates),
      timestamp: Date.now(),
    });
  },
});

export const cancel = mutation({
  args: {
    id: v.id("appointments"),
    cancelReason: v.optional(v.string()),
    organizationId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Appointment not found");
    }

    await ctx.db.patch(args.id, {
      status: "cancelled",
      cancelReason: args.cancelReason,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLog", {
      action: "appointment.cancelled",
      entityType: "appointment",
      entityId: args.id,
      userId: args.userId,
      organizationId: args.organizationId,
      details: JSON.stringify({ cancelReason: args.cancelReason }),
      timestamp: Date.now(),
    });

    const patient = await ctx.db.get(existing.patientId);
    if (patient) {
      await ctx.scheduler.runAfter(0, internal.notifications.create, {
        recipientUserId: args.userId,
        organizationId: args.organizationId,
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        message: `Appointment for ${patient.firstName} ${patient.lastName} on ${existing.date} at ${existing.startTime} has been cancelled.${args.cancelReason ? ` Reason: ${args.cancelReason}` : ""}`,
        entityType: "appointment",
        entityId: args.id,
        patientEmail: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        emailSubject: `Appointment Cancelled - ${existing.date}`,
      });
    }
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: statusValues,
    organizationId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Appointment not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLog", {
      action: "appointment.statusChanged",
      entityType: "appointment",
      entityId: args.id,
      userId: args.userId,
      organizationId: args.organizationId,
      details: JSON.stringify({ from: existing.status, to: args.status }),
      timestamp: Date.now(),
    });

    const patient = await ctx.db.get(existing.patientId);
    if (patient) {
      const notificationType = args.status === "confirmed" ? "appointment_confirmed" as const : "status_changed" as const;
      await ctx.scheduler.runAfter(0, internal.notifications.create, {
        recipientUserId: args.userId,
        organizationId: args.organizationId,
        type: notificationType,
        title: `Appointment ${args.status.charAt(0).toUpperCase() + args.status.slice(1)}`,
        message: `Appointment for ${patient.firstName} ${patient.lastName} has been updated to "${args.status}".`,
        entityType: "appointment",
        entityId: args.id,
        patientEmail: args.status === "confirmed" ? patient.email : undefined,
        patientName: `${patient.firstName} ${patient.lastName}`,
        emailSubject: args.status === "confirmed" ? `Your Appointment is Confirmed - ${existing.date}` : undefined,
      });
    }
  },
});

export const listByDate = query({
  args: {
    organizationId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_org_date", (q) =>
        q.eq("organizationId", args.organizationId).eq("date", args.date)
      )
      .collect();

    // Enrich with patient data
    const enriched = await Promise.all(
      appointments.map(async (apt) => {
        const patient = await ctx.db.get(apt.patientId);
        return { ...apt, patient };
      })
    );

    return enriched.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
});

export const listByDateRange = query({
  args: {
    organizationId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const filtered = appointments.filter(
      (apt) => apt.date >= args.startDate && apt.date <= args.endDate
    );

    const enriched = await Promise.all(
      filtered.map(async (apt) => {
        const patient = await ctx.db.get(apt.patientId);
        return { ...apt, patient };
      })
    );

    return enriched.sort((a, b) =>
      a.date === b.date
        ? a.startTime.localeCompare(b.startTime)
        : a.date.localeCompare(b.date)
    );
  },
});

export const listByDoctor = query({
  args: {
    doctorId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_doctor_date", (q) =>
        q.eq("doctorId", args.doctorId).eq("date", args.date)
      )
      .collect();

    const enriched = await Promise.all(
      appointments.map(async (apt) => {
        const patient = await ctx.db.get(apt.patientId);
        return { ...apt, patient };
      })
    );

    return enriched.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
});

export const listByPatient = query({
  args: {
    patientId: v.id("patients"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id("appointments"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const apt = await ctx.db.get(args.id);
    if (!apt || apt.organizationId !== args.organizationId) {
      return null;
    }
    const patient = await ctx.db.get(apt.patientId);
    return { ...apt, patient };
  },
});

export const getStats = query({
  args: {
    organizationId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_org_date", (q) =>
        q.eq("organizationId", args.organizationId).eq("date", args.date)
      )
      .collect();

    return {
      total: appointments.length,
      scheduled: appointments.filter((a) => a.status === "scheduled").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      waiting: appointments.filter((a) => a.status === "waiting").length,
      inProgress: appointments.filter((a) => a.status === "in-progress").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    };
  },
});
