"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";

const statusBadge: Record<string, string> = {
  scheduled: "bg-status-scheduled/10 text-status-scheduled",
  confirmed: "bg-status-confirmed/10 text-status-confirmed",
  waiting: "bg-status-waiting/10 text-status-waiting",
  "in-progress": "bg-status-in-progress/10 text-status-in-progress",
  completed: "bg-status-completed/10 text-status-completed",
  cancelled: "bg-status-cancelled/10 text-status-cancelled",
};

export default function PatientDetailPage() {
  const params = useParams();
  const { orgId } = useAuth();
  const id = params.id as Id<"patients">;

  const patient = useQuery(
    api.patients.getById,
    orgId ? { id, organizationId: orgId } : "skip"
  );

  const appointments = useQuery(
    api.appointments.listByPatient,
    orgId && patient ? { patientId: id, organizationId: orgId } : "skip"
  );

  const auditLog = useQuery(
    api.auditLog.getByEntity,
    orgId ? { entityType: "patient", entityId: id, organizationId: orgId } : "skip"
  );

  if (patient === undefined) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-foreground font-medium">Patient not found</p>
        <Link href="/dashboard/receptionist/patients" className="text-primary-600 text-sm mt-2 inline-block">
          ← Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/receptionist/patients"
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xl font-bold">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {patient.gender} · DOB: {patient.dateOfBirth}
            </p>
          </div>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
          patient.status === "active"
            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        }`}>
          {patient.status}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact & Details */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Contact</h3>
            <InfoItem icon={Phone} label="Phone" value={patient.phone} />
            {patient.email && <InfoItem icon={Mail} label="Email" value={patient.email} />}
            {patient.address && <InfoItem icon={MapPin} label="Address" value={patient.address} />}
          </div>

          {(patient.emergencyContactName || patient.emergencyContactPhone) && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Emergency Contact</h3>
              {patient.emergencyContactName && (
                <InfoItem icon={Heart} label="Name" value={patient.emergencyContactName} />
              )}
              {patient.emergencyContactPhone && (
                <InfoItem icon={Phone} label="Phone" value={patient.emergencyContactPhone} />
              )}
            </div>
          )}

          {(patient.insuranceProvider || patient.insurancePolicyNumber) && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Insurance</h3>
              {patient.insuranceProvider && (
                <InfoItem icon={Shield} label="Provider" value={patient.insuranceProvider} />
              )}
              {patient.insurancePolicyNumber && (
                <InfoItem icon={FileText} label="Policy #" value={patient.insurancePolicyNumber} />
              )}
            </div>
          )}
        </div>

        {/* Visit History + Audit */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-primary-600" />
              Visit History
            </h3>
            {appointments === undefined ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-2">
                {appointments.map((apt) => (
                  <Link
                    key={apt._id}
                    href={`/dashboard/receptionist/appointments/${apt._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex-shrink-0 text-center">
                      <p className="text-xs font-semibold text-foreground">{format(new Date(apt.date), "MMM d")}</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{apt.startTime}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium">Dr. {apt.doctorName}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{apt.reason}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[apt.status]}`}>
                      {apt.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6" style={{ color: "var(--text-secondary)" }}>
                No visit history yet
              </p>
            )}
          </div>

          {/* Audit */}
          {auditLog && auditLog.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock size={16} className="text-primary-600" />
                Audit Trail
              </h3>
              <div className="space-y-2">
                {auditLog.slice(0, 10).map((log) => (
                  <div key={log._id} className="flex items-start gap-3 p-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">{log.action}</p>
                      <p style={{ color: "var(--text-tertiary)" }}>
                        {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-primary-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
