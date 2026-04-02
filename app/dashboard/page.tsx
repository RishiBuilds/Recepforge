"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { orgRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (orgRole === "org:receptionist") {
      router.replace("/dashboard/receptionist");
    } else if (orgRole === "org:doctor") {
      router.replace("/dashboard/doctor");
    } else if (orgRole === "org:admin") {
      router.replace("/dashboard/receptionist");
    }
  }, [orgRole, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center animate-fade-in">
        <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
        <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
