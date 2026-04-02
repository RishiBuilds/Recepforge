"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-status-scheduled/10 text-status-scheduled",
  confirmed: "bg-status-confirmed/10 text-status-confirmed",
  waiting: "bg-status-waiting/10 text-status-waiting",
  "in-progress": "bg-status-in-progress/10 text-status-in-progress",
  completed: "bg-status-completed/10 text-status-completed",
  cancelled: "bg-status-cancelled/10 text-status-cancelled",
};

export default function ReceptionistOverview() {
  const { orgId } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const stats = useQuery(
    api.appointments.getStats,
    orgId ? { organizationId: orgId, date: today } : "skip"
  );

  const todayAppointments = useQuery(
    api.appointments.listByDate,
    orgId ? { organizationId: orgId, date: today } : "skip"
  );

  const patients = useQuery(
    api.patients.list,
    orgId ? { organizationId: orgId } : "skip"
  );

  const isLoading = stats === undefined || todayAppointments === undefined;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good {getGreeting()}, Receptionist
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/receptionist/appointments/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 hover:shadow-lg"
          >
            <Plus size={16} />
            New Appointment
          </Link>
          <Link
            href="/dashboard/receptionist/patients/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors"
          >
            <UserPlus size={16} />
            New Patient
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard
          label="Today's Appointments"
          value={stats?.total ?? 0}
          icon={Calendar}
          color="from-blue-500 to-blue-600"
          loading={isLoading}
        />
        <StatsCard
          label="Completed"
          value={stats?.completed ?? 0}
          icon={CheckCircle2}
          color="from-emerald-500 to-emerald-600"
          loading={isLoading}
        />
        <StatsCard
          label="Waiting"
          value={(stats?.waiting ?? 0) + (stats?.scheduled ?? 0)}
          icon={Clock}
          color="from-amber-500 to-amber-600"
          loading={isLoading}
        />
        <StatsCard
          label="Total Patients"
          value={patients?.length ?? 0}
          icon={Users}
          color="from-violet-500 to-violet-600"
          loading={isLoading}
        />
      </div>

      {/* Today's Appointments */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Today&apos;s Schedule
          </h2>
          <Link
            href="/dashboard/receptionist/appointments"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : todayAppointments && todayAppointments.length > 0 ? (
          <div className="space-y-2">
            {todayAppointments.slice(0, 8).map((apt) => (
              <Link
                key={apt._id}
                href={`/dashboard/receptionist/appointments/${apt._id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-colors group"
              >
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {apt.startTime}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {apt.endTime}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {apt.patient?.firstName} {apt.patient?.lastName}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                    Dr. {apt.doctorName} · {apt.reason}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}
                >
                  {apt.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={40} className="mx-auto mb-3 text-primary-300" />
            <p className="text-sm font-medium text-foreground">No appointments today</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Click &quot;New Appointment&quot; to schedule one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            {label}
          </p>
          {loading ? (
            <div className="skeleton h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-foreground mt-1 animate-fade-in">
              {value}
            </p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
