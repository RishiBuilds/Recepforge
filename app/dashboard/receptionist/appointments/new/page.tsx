"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Calendar, Clock, Search, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? "00" : "30";
  if (hour > 19) return null;
  return `${hour.toString().padStart(2, "0")}:${min}`;
}).filter(Boolean) as string[];

export default function NewAppointmentPage() {
  const { orgId, userId } = useAuth();
  const router = useRouter();
  const createAppointment = useMutation(api.appointments.create);

  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const patients = useQuery(
    api.patients.search,
    orgId ? { organizationId: orgId, searchTerm: patientSearch } : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !userId || !selectedPatientId) return;

    if (!doctorName.trim()) {
      toast.error("Please enter a doctor name");
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment({
        patientId: selectedPatientId,
        doctorId: doctorId || `doc_${doctorName.toLowerCase().replace(/\s+/g, "_")}`,
        doctorName: doctorName,
        organizationId: orgId,
        date,
        startTime,
        endTime,
        reason,
        userId,
      });
      toast.success("Appointment created successfully!");
      router.push("/dashboard/receptionist/appointments");
    } catch (error: any) {
      toast.error(error.message || "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/receptionist/appointments"
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Appointment</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Schedule a new patient appointment
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {/* Patient Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Patient *
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search patient by name..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setSelectedPatientId(null);
                setShowPatientDropdown(true);
              }}
              onFocus={() => setShowPatientDropdown(true)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground placeholder:text-[var(--text-tertiary)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>
          {showPatientDropdown && patients && patients.length > 0 && !selectedPatientId && (
            <div className="absolute z-10 w-full mt-1 bg-surface border border-surface-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {patients.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    setSelectedPatientId(p._id);
                    setPatientSearch(`${p.firstName} ${p.lastName}`);
                    setShowPatientDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface-hover transition-colors flex items-center gap-3 text-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-bold shrink-0">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{p.firstName} {p.lastName}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{p.phone}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedPatientId && (
            <p className="text-xs mt-1 text-primary-600">✓ Patient selected</p>
          )}
        </div>

        {/* Doctor */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Doctor Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Dr. Mehta"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground placeholder:text-[var(--text-tertiary)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Start Time *
            </label>
            <select
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                const idx = timeSlots.indexOf(e.target.value);
                if (idx < timeSlots.length - 1) {
                  setEndTime(timeSlots[idx + 1]);
                }
              }}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground focus:border-primary-500 outline-none transition-all"
            >
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              End Time *
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground focus:border-primary-500 outline-none transition-all"
            >
              {timeSlots
                .filter((t) => t > startTime)
                .map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Reason for Visit *
          </label>
          <textarea
            placeholder="Describe the reason for the visit..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground placeholder:text-[var(--text-tertiary)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !selectedPatientId}
            className="flex-1 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Calendar size={16} />
            )}
            {submitting ? "Creating..." : "Create Appointment"}
          </button>
          <Link
            href="/dashboard/receptionist/appointments"
            className="px-6 py-2.5 rounded-xl border border-surface-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
