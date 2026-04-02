"use client";

import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SelectOrgPage() {
  const { organization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (organization) {
      router.push("/dashboard");
    }
  }, [organization, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-primary-100 dark:from-primary-950 dark:via-background dark:to-primary-900 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="glass-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white mb-6 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M9 8h1" />
              <path d="M9 12h1" />
              <path d="M9 16h1" />
              <path d="M14 8h1" />
              <path d="M14 12h1" />
              <path d="M14 16h1" />
              <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Select Your Clinic
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Choose the clinic organization you want to access, or create a new one.
          </p>
          <div className="flex justify-center">
            <OrganizationSwitcher
              hidePersonal={true}
              afterSelectOrganizationUrl="/dashboard"
              afterCreateOrganizationUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger:
                    "w-full justify-between px-4 py-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-foreground hover:border-primary-400 transition-colors",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
