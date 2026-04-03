import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const notificationTypeValues = v.union(
  v.literal("appointment_created"),
  v.literal("appointment_confirmed"),
  v.literal("appointment_cancelled"),
  v.literal("appointment_reminder"),
  v.literal("status_changed")
);

export const create = internalMutation({
  args: {
    recipientUserId: v.string(),
    organizationId: v.string(),
    type: notificationTypeValues,
    title: v.string(),
    message: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    patientEmail: v.optional(v.string()),
    patientName: v.optional(v.string()),
    emailSubject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const notificationId = await ctx.db.insert("notifications", {
      recipientUserId: args.recipientUserId,
      organizationId: args.organizationId,
      type: args.type,
      title: args.title,
      message: args.message,
      entityType: args.entityType,
      entityId: args.entityId,
      isRead: false,
      emailSent: false,
      createdAt: now,
    });

    if (args.patientEmail) {
      await ctx.scheduler.runAfter(0, internal.emails.sendNotificationEmail, {
        notificationId,
        to: args.patientEmail,
        patientName: args.patientName || "Patient",
        subject: args.emailSubject || args.title,
        title: args.title,
        message: args.message,
        type: args.type,
      });
    }

    return notificationId;
  },
});

export const markEmailSent = internalMutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { emailSent: true });
  },
});

export const list = query({
  args: {
    organizationId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient_org", (q) =>
        q.eq("recipientUserId", args.userId).eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) =>
        q.eq("recipientUserId", args.userId).eq("isRead", false)
      )
      .take(100);
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: {
    id: v.id("notifications"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.recipientUserId !== args.userId) {
      throw new Error("Notification not found");
    }
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {
    userId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) =>
        q.eq("recipientUserId", args.userId).eq("isRead", false)
      )
      .take(100);

    const orgUnread = unread.filter(
      (n) => n.organizationId === args.organizationId
    );

    for (const notification of orgUnread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});
