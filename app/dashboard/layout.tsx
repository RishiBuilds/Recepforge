"use client";

import { useAuth, useOrganization, UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const receptionistNav: NavItem[] = [
  { label: "Overview", href: "/dashboard/receptionist", icon: LayoutDashboard },
  { label: "Appointments", href: "/dashboard/receptionist/appointments", icon: Calendar },
  { label: "Patients", href: "/dashboard/receptionist/patients", icon: Users },
];

const doctorNav: NavItem[] = [
  { label: "My Schedule", href: "/dashboard/doctor", icon: LayoutDashboard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgRole } = useAuth();
  const { organization } = useOrganization();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isReceptionist = orgRole === "org:receptionist" || orgRole === "org:admin";
  const isDoctor = orgRole === "org:doctor" || orgRole === "org:admin";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [];
  if (isReceptionist) navItems.push(...receptionistNav);
  if (isDoctor) navItems.push(...doctorNav);

  const isActive = (href: string) => {
    if (href === "/dashboard/receptionist" || href === "/dashboard/doctor") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar-bg transition-all duration-300 ${
          sidebarCollapsed ? "w-[72px]" : "w-64"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shrink-0">
            <Activity size={20} />
          </div>
          {!sidebarCollapsed && (
            <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
              RecepForge
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto lg:hidden text-sidebar-text hover:text-white p-1"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Org name */}
        {!sidebarCollapsed && organization && (
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs text-sidebar-text uppercase tracking-wider">Clinic</p>
            <p className="text-sm text-white font-medium truncate mt-0.5">
              {organization.name}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-sidebar-active text-white shadow-md shadow-primary-600/20"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon
                  size={20}
                  className={`shrink-0 ${active ? "text-white" : "text-sidebar-text group-hover:text-white"}`}
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex px-3 py-3 border-t border-white/10">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors text-sm"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 bg-surface/80 backdrop-blur-md border-b border-surface-border flex items-center justify-between px-4 lg:px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-surface-hover text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-foreground capitalize">
                {pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-hover text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              <Stethoscope size={14} />
              <span className="hidden sm:inline capitalize">
                {orgRole?.replace("org:", "") || "Member"}
              </span>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-xl",
                },
              }}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
