"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellRing,
  Calendar,
  Check,
  CheckCheck,
  X,
  XCircle,
  RefreshCw,
  Info,
} from "lucide-react";

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  appointment_created: {
    icon: Calendar,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  appointment_confirmed: {
    icon: Check,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  appointment_cancelled: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  appointment_reminder: {
    icon: BellRing,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  status_changed: {
    icon: RefreshCw,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
};

export default function NotificationBell() {
  const { orgId, userId } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    userId ? { userId } : "skip"
  );

  const notifications = useQuery(
    api.notifications.list,
    orgId && userId ? { organizationId: orgId, userId } : "skip"
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (
    notificationId: Id<"notifications">,
    entityType: string,
    entityId: string,
    isRead: boolean
  ) => {
    if (!userId) return;

    if (!isRead) {
      await markAsRead({ id: notificationId, userId });
    }

    setIsOpen(false);

    if (entityType === "appointment") {
      router.push(`/dashboard/receptionist/appointments/${entityId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId || !orgId) return;
    await markAllAsRead({ userId, organizationId: orgId });
  };

  const displayCount = unreadCount ?? 0;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-surface-hover transition-all duration-200 text-foreground group"
        aria-label={`Notifications${displayCount > 0 ? ` (${displayCount} unread)` : ""}`}
        id="notification-bell"
      >
        {displayCount > 0 ? (
          <BellRing
            size={20}
            className="group-hover:scale-110 transition-transform duration-200"
          />
        ) : (
          <Bell
            size={20}
            className="group-hover:scale-110 transition-transform duration-200"
          />
        )}

        {/* Badge */}
        {displayCount > 0 && (
          <span className="notification-badge">
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="notification-panel"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>
              {displayCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-bold leading-none">
                  {displayCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {displayCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Close notifications"
              >
                <X size={16} className="opacity-50" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="notification-list">
            {notifications === undefined ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 w-full" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 mx-auto rounded-xl bg-surface-hover flex items-center justify-center mb-3">
                  <Bell
                    size={24}
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No notifications yet
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  You&apos;ll be notified about appointment updates
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const config = typeConfig[notification.type] || {
                  icon: Info,
                  color: "text-gray-500",
                  bgColor: "bg-gray-500/10",
                };
                const IconComponent = config.icon;

                return (
                  <button
                    key={notification._id}
                    onClick={() =>
                      handleNotificationClick(
                        notification._id,
                        notification.entityType,
                        notification.entityId,
                        notification.isRead
                      )
                    }
                    className={`notification-item ${!notification.isRead ? "notification-item--unread" : ""}`}
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={`notification-item-icon ${config.bgColor}`}
                    >
                      <IconComponent size={16} className={config.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm leading-tight truncate ${
                            !notification.isRead
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p
                        className="text-xs mt-0.5 line-clamp-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {notification.message}
                      </p>
                      <p
                        className="text-[11px] mt-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {formatDistanceToNow(notification.createdAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
