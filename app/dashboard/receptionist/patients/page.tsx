"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Download, Plus, Search, UserPlus, Users } from "lucide-react";
import { exportToCsv } from "@/app/lib/csvExport";

export default function PatientsPage() {
  const { orgId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const patients = useQuery(
    api.patients.search,
    orgId ? { organizationId: orgId, searchTerm: searchQuery } : "skip"
  );

  const filtered = patients?.filter((p) => {
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Patient Directory</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!filtered?.length) return;
              exportToCsv(
                filtered,
                [
                  { header: "First Name", accessor: (p) => p.firstName },
                  { header: "Last Name", accessor: (p) => p.lastName },
                  { header: "Date of Birth", accessor: (p) => p.dateOfBirth },
                  { header: "Gender", accessor: (p) => p.gender },
                  { header: "Phone", accessor: (p) => p.phone },
                  { header: "Email", accessor: (p) => p.email },
                  { header: "Address", accessor: (p) => p.address },
                  { header: "Insurance Provider", accessor: (p) => p.insuranceProvider },
                  { header: "Policy Number", accessor: (p) => p.insurancePolicyNumber },
                  { header: "Emergency Contact", accessor: (p) => p.emergencyContactName },
                  { header: "Emergency Phone", accessor: (p) => p.emergencyContactPhone },
                  { header: "Status", accessor: (p) => p.status },
                ],
                `patient_directory_${format(new Date(), "yyyy-MM-dd")}`
              );
            }}
            disabled={!filtered?.length}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
          <Link
            href="/dashboard/receptionist/patients/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20"
          >
            <UserPlus size={16} />
            Add Patient
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground placeholder:text-[var(--text-tertiary)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground outline-none focus:border-primary-500"
        >
          <option value="all">All Patients</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Patient List */}
      {patients === undefined ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-36 w-full" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((patient) => (
            <Link
              key={patient._id}
              href={`/dashboard/receptionist/patients/${patient._id}`}
              className="glass-card p-5 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-lg font-bold shrink-0 group-hover:scale-105 transition-transform">
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {patient.gender} · DOB: {patient.dateOfBirth}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                    patient.status === "active"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {patient.status}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-surface-border space-y-1">
                <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  📞 {patient.phone}
                </p>
                {patient.email && (
                  <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                    ✉️ {patient.email}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Users size={40} className="mx-auto mb-3 text-primary-300" />
          <p className="text-sm font-medium text-foreground">No patients found</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {searchQuery ? "Try a different search term" : "Add your first patient to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
