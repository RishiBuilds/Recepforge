import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patients: defineTable({
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
    status: v.union(v.literal("active"), v.literal("inactive")),
    organizationId: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_org_status", ["organizationId", "status"])
    .searchIndex("search_name", {
      searchField: "firstName",
      filterFields: ["organizationId"],
    }),

  appointments: defineTable({
    patientId: v.id("patients"),
    doctorId: v.string(),
    doctorName: v.string(),
    organizationId: v.string(),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("waiting"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    reason: v.string(),
    cancelReason: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_org_date", ["organizationId", "date"])
    .index("by_doctor_date", ["doctorId", "date"])
    .index("by_patient", ["patientId"])
    .index("by_org_status", ["organizationId", "status"]),

  clinicalNotes: defineTable({
    appointmentId: v.id("appointments"),
    patientId: v.id("patients"),
    doctorId: v.string(),
    organizationId: v.string(),
    content: v.string(),
    template: v.optional(v.string()),
    isDraft: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_appointment", ["appointmentId"])
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"]),

  auditLog: defineTable({
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    userId: v.string(),
    organizationId: v.string(),
    details: v.string(),
    timestamp: v.number(),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_org", ["organizationId"]),

  notifications: defineTable({
    recipientUserId: v.string(),
    organizationId: v.string(),
    type: v.union(
      v.literal("appointment_created"),
      v.literal("appointment_confirmed"),
      v.literal("appointment_cancelled"),
      v.literal("appointment_reminder"),
      v.literal("status_changed")
    ),
    title: v.string(),
    message: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    isRead: v.boolean(),
    emailSent: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipient_org", ["recipientUserId", "organizationId"])
    .index("by_recipient_read", ["recipientUserId", "isRead"]),
});
