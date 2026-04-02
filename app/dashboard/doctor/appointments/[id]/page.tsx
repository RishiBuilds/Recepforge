"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Phone,
  Save,
  Stethoscope,
  User,
} from "lucide-react";

const templates: Record<string, string> = {
  general: `## General Checkup

**Chief Complaint:**


**Vitals:**
- BP:
- Heart Rate:
- Temperature:
- SpO2:

**Examination:**


**Assessment:**


**Plan:**

`,
  followup: `## Follow-up Visit

**Previous Diagnosis:**


**Progress Since Last Visit:**


**Current Symptoms:**


**Examination:**


**Plan:**
- [ ] Continue current medications
- [ ] Adjust dosage
- [ ] Order labs
- [ ] Schedule follow-up

`,
  newcomplaint: `## New Complaint

**Chief Complaint:**


**History of Present Illness:**
- Onset:
- Duration:
- Severity (1-10):
- Aggravating factors:
- Relieving factors:

**Examination:**


**Differential Diagnosis:**
1.
2.
3.

**Plan:**

`,
};

export default function DoctorAppointmentDetailPage() {
  const params = useParams();
  const { orgId, userId } = useAuth();
  const id = params.id as Id<"appointments">;

  const appointment = useQuery(
    api.appointments.getById,
    orgId ? { id, organizationId: orgId } : "skip"
  );

  const existingNotes = useQuery(
    api.clinicalNotes.getByAppointment,
    orgId ? { appointmentId: id, organizationId: orgId } : "skip"
  );

  const patientNotes = useQuery(
    api.clinicalNotes.getByPatient,
    orgId && appointment?.patientId
      ? { patientId: appointment.patientId, organizationId: orgId }
      : "skip"
  );

  const patientAppointments = useQuery(
    api.appointments.listByPatient,
    orgId && appointment?.patientId
      ? { patientId: appointment.patientId, organizationId: orgId }
      : "skip"
  );

  const createNote = useMutation(api.clinicalNotes.create);
  const updateNote = useMutation(api.clinicalNotes.update);
  const updateStatus = useMutation(api.appointments.updateStatus);

  const [noteContent, setNoteContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingNoteId, setExistingNoteId] = useState<Id<"clinicalNotes"> | null>(null);

  useEffect(() => {
    if (existingNotes && existingNotes.length > 0) {
      setNoteContent(existingNotes[0].content);
      setExistingNoteId(existingNotes[0]._id);
    }
  }, [existingNotes]);

  const handleTemplateSelect = (key: string) => {
    if (noteContent && !confirm("Replace current notes with template?")) return;
    setNoteContent(templates[key]);
    setSelectedTemplate(key);
  };

  const handleSave = async (isDraft: boolean) => {
    if (!orgId || !userId || !appointment) return;
    setSaving(true);
    try {
      if (existingNoteId) {
        await updateNote({
          id: existingNoteId,
          content: noteContent,
          isDraft,
          organizationId: orgId,
        });
      } else {
        const noteId = await createNote({
          appointmentId: id,
          patientId: appointment.patientId,
          doctorId: userId,
          organizationId: orgId,
          content: noteContent,
          template: selectedTemplate || undefined,
          isDraft,
        });
        setExistingNoteId(noteId);
      }

      if (!isDraft && appointment.status !== "completed") {
        await updateStatus({
          id,
          status: "completed",
          organizationId: orgId,
          userId,
        });
      }

      toast.success(isDraft ? "Draft saved" : "Notes finalized & appointment completed");
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (appointment === undefined) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="skeleton h-96" />
          <div className="lg:col-span-2 skeleton h-96" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <p className="text-foreground font-medium">Appointment not found</p>
        <Link href="/dashboard/doctor" className="text-primary-600 text-sm mt-2 inline-block">← Back to schedule</Link>
      </div>
    );
  }

  const previousNotes = patientNotes?.filter((n) => n.appointmentId !== id) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/doctor" className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {appointment.patient?.firstName} {appointment.patient?.lastName}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {format(new Date(appointment.date), "MMMM d, yyyy")} · {appointment.startTime} – {appointment.endTime}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel: Patient Info */}
        <div className="space-y-4">
          {/* Patient Summary */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User size={14} className="text-primary-600" />
              Patient Summary
            </h3>
            {appointment.patient && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 pb-3 border-b border-surface-border">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-lg font-bold">
                    {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {appointment.patient.gender} · DOB: {appointment.patient.dateOfBirth}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                    <Phone size={12} /> {appointment.patient.phone}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Visit Context */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} className="text-primary-600" />
              Visit Context
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Reason</p>
                <p className="text-sm text-foreground">{appointment.reason}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Status</p>
                <p className="text-sm text-foreground capitalize">{appointment.status}</p>
              </div>
            </div>
          </div>

          {/* Previous Visit History */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock size={14} className="text-primary-600" />
              Recent Visits ({patientAppointments?.length ?? 0})
            </h3>
            {patientAppointments && patientAppointments.length > 1 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {patientAppointments
                  .filter((a) => a._id !== id)
                  .slice(0, 5)
                  .map((a) => (
                    <div key={a._id} className="p-2 rounded-lg bg-surface-hover text-xs">
                      <p className="font-medium text-foreground">
                        {format(new Date(a.date), "MMM d, yyyy")}
                      </p>
                      <p style={{ color: "var(--text-secondary)" }}>{a.reason}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>First visit</p>
            )}
          </div>

          {/* Previous Notes */}
          {previousNotes.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-primary-600" />
                Previous Notes
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {previousNotes.slice(0, 3).map((note) => (
                  <div key={note._id} className="p-3 rounded-lg bg-surface-hover text-xs">
                    <p className="font-medium text-foreground mb-1">
                      {format(new Date(note.createdAt), "MMM d, yyyy")}
                      {note.isDraft && (
                        <span className="ml-2 text-amber-600 text-[10px]">DRAFT</span>
                      )}
                    </p>
                    <p className="whitespace-pre-wrap line-clamp-4" style={{ color: "var(--text-secondary)" }}>
                      {note.content.replace(/[#*\-\[\]]/g, "").trim().slice(0, 200)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Clinical Notes Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Templates */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Stethoscope size={16} className="text-primary-600" />
                Clinical Notes
              </h3>
              <div className="flex gap-2">
                {Object.entries({ general: "General", followup: "Follow-up", newcomplaint: "New Complaint" }).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleTemplateSelect(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedTemplate === key
                          ? "bg-primary-600 text-white"
                          : "border border-surface-border text-foreground hover:bg-surface-hover"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Editor */}
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start typing your clinical notes... Use markdown for formatting (## headers, **bold**, - bullets)"
              className="w-full min-h-[400px] px-4 py-3 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground placeholder:text-[var(--text-tertiary)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-y font-mono leading-relaxed note-editor"
            />

            {/* Save Actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {noteContent.length} characters
                {existingNoteId && " · Auto-saved"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || !noteContent.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-surface-border text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving || !noteContent.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Complete & Finalize
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
