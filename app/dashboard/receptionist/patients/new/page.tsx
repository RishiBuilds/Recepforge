"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function NewPatientPage() {
  const { orgId, userId } = useAuth();
  const router = useRouter();
  const createPatient = useMutation(api.patients.create);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female" | "other",
    phone: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !userId) return;

    setSubmitting(true);
    try {
      await createPatient({
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        insuranceProvider: form.insuranceProvider || undefined,
        insurancePolicyNumber: form.insurancePolicyNumber || undefined,
        organizationId: orgId,
        userId,
      });
      toast.success("Patient added successfully!");
      router.push("/dashboard/receptionist/patients");
    } catch (error: any) {
      toast.error(error.message || "Failed to add patient");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground placeholder:text-[var(--text-tertiary)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/receptionist/patients"
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Patient</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Register a new patient in the system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                required
                placeholder="Rajesh"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                required
                placeholder="Sharma"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth *</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                className={inputClass}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Contact Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="rajesh.sharma@email.com"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="42, MG Road, Koramangala, Bengaluru 560034"
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Emergency Contact
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contact Name</label>
              <input
                type="text"
                value={form.emergencyContactName}
                onChange={(e) => updateField("emergencyContactName", e.target.value)}
                placeholder="Sunita Sharma"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contact Phone</label>
              <input
                type="tel"
                value={form.emergencyContactPhone}
                onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
                placeholder="+91 91234 56789"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Insurance Information <span className="text-xs font-normal normal-case" style={{ color: "var(--text-tertiary)" }}>(Optional)</span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Provider</label>
              <input
                type="text"
                value={form.insuranceProvider}
                onChange={(e) => updateField("insuranceProvider", e.target.value)}
                placeholder="Star Health / ICICI Lombard"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Policy Number</label>
              <input
                type="text"
                value={form.insurancePolicyNumber}
                onChange={(e) => updateField("insurancePolicyNumber", e.target.value)}
                placeholder="SHI-2026-4587321"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            {submitting ? "Adding..." : "Add Patient"}
          </button>
          <Link
            href="/dashboard/receptionist/patients"
            className="px-6 py-2.5 rounded-xl border border-surface-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
