"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, addDays, subDays } from "date-fns";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Square,
  Stethoscope,
  User,
} from "lucide-react";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  scheduled: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-status-scheduled" },
  confirmed: { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-700 dark:text-teal-300", dot: "bg-status-confirmed" },
  waiting: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-status-waiting" },
  "in-progress": { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-status-in-progress" },
  completed: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-status-completed" },
  cancelled: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300", dot: "bg-status-cancelled" },
};

export default function DoctorDashboard() {
  const { orgId, userId } = useAuth();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

  const appointments = useQuery(
    api.appointments.listByDoctor,
    userId ? { doctorId: userId, date: dateStr } : "skip"
  );

  const allDayAppointments = useQuery(
    api.appointments.listByDate,
    orgId ? { organizationId: orgId, date: dateStr } : "skip"
  );

  const myAppointments = allDayAppointments?.filter(
    (a) => a.doctorId === userId || a.doctorName.toLowerCase().includes((user?.firstName || "").toLowerCase())
  ) || appointments;

  const updateStatus = useMutation(api.appointments.updateStatus);

  const handleStatusUpdate = async (appointmentId: any, newStatus: string) => {
    if (!orgId || !userId) return;
    try {
      await updateStatus({
        id: appointmentId,
        status: newStatus as any,
        organizationId: orgId,
        userId,
      });
      toast.success(`Appointment ${newStatus === "in-progress" ? "started" : newStatus}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const completed = myAppointments?.filter((a) => a.status === "completed").length ?? 0;
  const remaining = myAppointments?.filter((a) => !["completed", "cancelled"].includes(a.status)).length ?? 0;
  const inProgress = myAppointments?.find((a) => a.status === "in-progress");

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isToday ? "Today's Schedule" : format(selectedDate, "EEEE's Schedule")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>

        {/* Date Nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isToday
                ? "bg-primary-600 text-white"
                : "border border-surface-border text-foreground hover:bg-surface-hover"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-foreground"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{myAppointments?.length ?? 0}</p>
          <p className="text-xs font-medium mt-1" style={{ color: "var(--text-secondary)" }}>Total</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{completed}</p>
          <p className="text-xs font-medium mt-1" style={{ color: "var(--text-secondary)" }}>Completed</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{remaining}</p>
          <p className="text-xs font-medium mt-1" style={{ color: "var(--text-secondary)" }}>Remaining</p>
        </div>
      </div>

      {/* Current Appointment */}
      {inProgress && (
        <div className="glass-card p-5 ring-2 ring-indigo-500 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="status-dot bg-status-in-progress" style={{ color: "var(--color-status-in-progress)" }} />
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              In Progress
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-lg font-bold">
              {inProgress.patient?.firstName?.[0]}{inProgress.patient?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {inProgress.patient?.firstName} {inProgress.patient?.lastName}
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {inProgress.startTime} – {inProgress.endTime} · {inProgress.reason}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/doctor/appointments/${inProgress._id}`}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Stethoscope size={14} />
                Notes
              </Link>
              <button
                onClick={() => handleStatusUpdate(inProgress._id, "completed")}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-surface-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar size={16} className="text-primary-600" />
            Appointments
          </h2>
        </div>

        {myAppointments === undefined ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-20 w-full" />)}
          </div>
        ) : myAppointments.length > 0 ? (
          <div className="divide-y divide-surface-border">
            {myAppointments.map((apt) => {
              const config = statusConfig[apt.status];
              const canStart = apt.status === "waiting" || apt.status === "confirmed" || apt.status === "scheduled";
              const canComplete = apt.status === "in-progress";

              return (
                <div
                  key={apt._id}
                  className={`p-4 flex items-center gap-4 transition-colors hover:bg-surface-hover ${
                    apt.status === "cancelled" ? "opacity-50" : ""
                  }`}
                >
                  {/* Time */}
                  <div className="w-20 text-center shrink-0">
                    <p className="text-sm font-bold text-foreground">{apt.startTime}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{apt.endTime}</p>
                  </div>

                  {/* Status Line */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-3 h-3 rounded-full ${config.dot}`} />
                    <div className="w-px h-8 bg-surface-border" />
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-bold shrink-0">
                        {apt.patient?.firstName?.[0]}{apt.patient?.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {apt.patient?.firstName} {apt.patient?.lastName}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                          {apt.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} hidden sm:inline-flex`}>
                    {apt.status}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1.5 shrink-0">
                    {canStart && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, "in-progress")}
                        className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                        title="Start Appointment"
                      >
                        <Play size={14} />
                      </button>
                    )}
                    {canComplete && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, "completed")}
                        className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                        title="Complete"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    <Link
                      href={`/dashboard/doctor/appointments/${apt._id}`}
                      className="p-2 rounded-lg bg-surface-hover text-foreground hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors"
                      title="View Details"
                    >
                      <Stethoscope size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <Calendar size={40} className="mx-auto mb-3 text-primary-300" />
            <p className="text-sm font-medium text-foreground">No appointments for this day</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Use the date navigation to check other days
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
