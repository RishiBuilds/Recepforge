"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit2,
  FileText,
  Phone,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-status-scheduled/10 text-status-scheduled border-status-scheduled/20",
  confirmed: "bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20",
  waiting: "bg-status-waiting/10 text-status-waiting border-status-waiting/20",
  "in-progress": "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20",
  completed: "bg-status-completed/10 text-status-completed border-status-completed/20",
  cancelled: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20",
};

const statusTransitions: Record<string, string[]> = {
  scheduled: ["confirmed", "waiting", "cancelled"],
  confirmed: ["waiting", "cancelled"],
  waiting: ["in-progress", "cancelled"],
  "in-progress": ["completed"],
  completed: [],
  cancelled: [],
};

export default function AppointmentDetailPage() {
  const params = useParams();
  const { orgId, userId } = useAuth();
  const router = useRouter();
  const id = params.id as Id<"appointments">;

  const appointment = useQuery(
    api.appointments.getById,
    orgId ? { id, organizationId: orgId } : "skip"
  );

  const updateStatus = useMutation(api.appointments.updateStatus);
  const cancelAppointment = useMutation(api.appointments.cancel);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (appointment === undefined) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-foreground font-medium">Appointment not found</p>
        <Link href="/dashboard/receptionist/appointments" className="text-primary-600 text-sm mt-2 inline-block">
          ← Back to appointments
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!orgId || !userId) return;
    try {
      await updateStatus({
        id,
        status: newStatus as any,
        organizationId: orgId,
        userId,
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleCancel = async () => {
    if (!orgId || !userId) return;
    try {
      await cancelAppointment({
        id,
        cancelReason,
        organizationId: orgId,
        userId,
      });
      toast.success("Appointment cancelled");
      setShowCancelModal(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel");
    }
  };

  const nextStatuses = statusTransitions[appointment.status] || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/receptionist/appointments"
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Appointment Details</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {format(new Date(appointment.date), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[appointment.status]}`}>
          {appointment.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Appointment Info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16} className="text-primary-600" />
            Appointment
          </h3>
          <div className="space-y-3">
            <InfoRow label="Date" value={format(new Date(appointment.date), "MMMM d, yyyy")} />
            <InfoRow label="Time" value={`${appointment.startTime} – ${appointment.endTime}`} />
            <InfoRow label="Doctor" value={`Dr. ${appointment.doctorName}`} />
            <InfoRow label="Reason" value={appointment.reason} />
            {appointment.cancelReason && (
              <InfoRow label="Cancel Reason" value={appointment.cancelReason} />
            )}
          </div>
        </div>

        {/* Patient Info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <User size={16} className="text-primary-600" />
            Patient
          </h3>
          {appointment.patient && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-surface-border">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-lg font-bold">
                  {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {appointment.patient.gender} · DOB: {appointment.patient.dateOfBirth}
                  </p>
                </div>
              </div>
              <InfoRow label="Phone" value={appointment.patient.phone} />
              {appointment.patient.email && (
                <InfoRow label="Email" value={appointment.patient.email} />
              )}
              <Link
                href={`/dashboard/receptionist/patients/${appointment.patient._id}`}
                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
              >
                View full record →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {nextStatuses.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Update Status</h3>
          <div className="flex flex-wrap gap-2">
            {nextStatuses
              .filter((s) => s !== "cancelled")
              .map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-surface-border text-foreground hover:bg-surface-hover transition-colors capitalize"
                >
                  Mark as {status}
                </button>
              ))}
            {nextStatuses.includes("cancelled") && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-1.5"
              >
                <XCircle size={14} />
                Cancel Appointment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-md animate-scale-in space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Cancel Appointment</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to cancel? This action cannot be undone.
            </p>
            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground placeholder:text-[var(--text-tertiary)] focus:border-primary-500 outline-none transition-all resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 rounded-xl border border-surface-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors"
              >
                Keep Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <p className="text-sm text-foreground mt-0.5">{value}</p>
    </div>
  );
}
