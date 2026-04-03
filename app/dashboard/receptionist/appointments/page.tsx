"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  List,
  LayoutGrid,
  Plus,
  Search,
} from "lucide-react";
import { exportToCsv } from "@/app/lib/csvExport";

const statusColors: Record<string, string> = {
  scheduled: "bg-status-scheduled",
  confirmed: "bg-status-confirmed",
  waiting: "bg-status-waiting",
  "in-progress": "bg-status-in-progress",
  completed: "bg-status-completed",
  cancelled: "bg-status-cancelled",
};

const statusBadgeColors: Record<string, string> = {
  scheduled: "bg-status-scheduled/10 text-status-scheduled",
  confirmed: "bg-status-confirmed/10 text-status-confirmed",
  waiting: "bg-status-waiting/10 text-status-waiting",
  "in-progress": "bg-status-in-progress/10 text-status-in-progress",
  completed: "bg-status-completed/10 text-status-completed",
  cancelled: "bg-status-cancelled/10 text-status-cancelled",
};

type ViewMode = "list" | "calendar";

export default function AppointmentsPage() {
  const { orgId } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const startDate = format(weekStart, "yyyy-MM-dd");
  const endDate = format(endOfWeek(weekStart, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const appointments = useQuery(
    api.appointments.listByDateRange,
    orgId ? { organizationId: orgId, startDate, endDate } : "skip"
  );

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });

  const filteredAppointments = appointments?.filter((apt) => {
    if (statusFilter !== "all" && apt.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const patientName = `${apt.patient?.firstName} ${apt.patient?.lastName}`.toLowerCase();
      return (
        patientName.includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!filteredAppointments?.length) return;
              const dateRange = `${format(weekStart, "MMM_d")}-${format(endOfWeek(weekStart, { weekStartsOn: 1 }), "MMM_d_yyyy")}`;
              exportToCsv(
                filteredAppointments,
                [
                  { header: "Date", accessor: (a) => a.date },
                  { header: "Start Time", accessor: (a) => a.startTime },
                  { header: "End Time", accessor: (a) => a.endTime },
                  { header: "Patient First Name", accessor: (a) => a.patient?.firstName },
                  { header: "Patient Last Name", accessor: (a) => a.patient?.lastName },
                  { header: "Doctor", accessor: (a) => a.doctorName },
                  { header: "Reason", accessor: (a) => a.reason },
                  { header: "Status", accessor: (a) => a.status },
                ],
                `appointments_${dateRange}`
              );
            }}
            disabled={!filteredAppointments?.length}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
          <Link
            href="/dashboard/receptionist/appointments/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20"
          >
            <Plus size={16} />
            New Appointment
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search patient, doctor, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground placeholder:text-[var(--text-tertiary)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground outline-none focus:border-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="waiting">Waiting</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* View toggle */}
        <div className="flex rounded-xl border border-surface-border overflow-hidden">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
              viewMode === "list"
                ? "bg-primary-600 text-white"
                : "text-foreground hover:bg-surface-hover"
            }`}
          >
            <List size={16} />
            List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
              viewMode === "calendar"
                ? "bg-primary-600 text-white"
                : "text-foreground hover:bg-surface-hover"
            }`}
          >
            <LayoutGrid size={16} />
            Week
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekStart(subWeeks(weekStart, 1))}
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-foreground"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-sm font-semibold text-foreground">
          {format(weekStart, "MMM d")} – {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
        </h2>
        <button
          onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-foreground"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Content */}
      {appointments === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : viewMode === "list" ? (
        <ListView appointments={filteredAppointments || []} />
      ) : (
        <CalendarView
          appointments={filteredAppointments || []}
          weekDays={weekDays}
        />
      )}
    </div>
  );
}

function ListView({ appointments }: { appointments: any[] }) {
  if (appointments.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Calendar size={40} className="mx-auto mb-3 text-primary-300" />
        <p className="text-sm font-medium text-foreground">No appointments found</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          Try adjusting your filters or date range
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Date</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Time</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Patient</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>Doctor</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>Reason</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {appointments.map((apt) => (
              <tr key={apt._id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/receptionist/appointments/${apt._id}`} className="text-foreground font-medium hover:text-primary-600">
                    {format(new Date(apt.date), "MMM d")}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">{apt.startTime} – {apt.endTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-bold">
                      {apt.patient?.firstName?.[0]}{apt.patient?.lastName?.[0]}
                    </div>
                    <span className="text-foreground font-medium">
                      {apt.patient?.firstName} {apt.patient?.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                  Dr. {apt.doctorName}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell max-w-[200px] truncate" style={{ color: "var(--text-secondary)" }}>
                  {apt.reason}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeColors[apt.status]}`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarView({ appointments, weekDays }: { appointments: any[]; weekDays: Date[] }) {
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayAppts = appointments.filter((a) => a.date === dateStr);
        const isToday = dateStr === today;

        return (
          <div
            key={dateStr}
            className={`glass-card p-3 min-h-[200px] ${isToday ? "ring-2 ring-primary-500" : ""}`}
          >
            <div className={`text-center mb-2 pb-2 border-b border-surface-border ${isToday ? "text-primary-600 font-bold" : ""}`}>
              <p className="text-xs uppercase" style={{ color: isToday ? undefined : "var(--text-tertiary)" }}>
                {format(day, "EEE")}
              </p>
              <p className={`text-lg font-semibold ${isToday ? "text-primary-600" : "text-foreground"}`}>
                {format(day, "d")}
              </p>
            </div>
            <div className="space-y-1">
              {dayAppts.map((apt) => (
                <Link
                  key={apt._id}
                  href={`/dashboard/receptionist/appointments/${apt._id}`}
                  className="block p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusColors[apt.status]}`} />
                    <span className="text-xs font-medium text-foreground truncate">
                      {apt.startTime}
                    </span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {apt.patient?.firstName} {apt.patient?.lastName?.[0]}.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
