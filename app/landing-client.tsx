"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Activity,
  Calendar,
  ClipboardList,
  Shield,
  Users,
  Stethoscope,
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  ChevronRight,
  Heart,
  Thermometer,
  Pill,
} from "lucide-react";

const clinics = [
  "Apollo Multispeciality Clinic",
  "Fortis Family Health",
  "Medanta Primary Care",
  "Max Healthcare Center",
  "Narayana Health Clinic",
  "AIIMS Community Outreach",
];

const calendarSlots = [
  { time: "09:00", patient: "Ananya Sharma", type: "Annual Physical", status: "completed", doctor: "Dr. Mehta" },
  { time: "09:30", patient: "Vikram Desai", type: "BP Follow-up", status: "completed", doctor: "Dr. Mehta" },
  { time: "10:00", patient: "Priya Nair", type: "New Patient Consult", status: "active", doctor: "Dr. Reddy" },
  { time: "10:30", patient: "-", type: "Available", status: "free", doctor: "" },
  { time: "11:00", patient: "Rohan Kapoor", type: "Diabetes Review", status: "upcoming", doctor: "Dr. Mehta" },
  { time: "11:30", patient: "Fatima Khan", type: "Acute - Chest Pain", status: "urgent", doctor: "Dr. Reddy" },
  { time: "12:00", patient: "-", type: "Lunch Break", status: "free", doctor: "" },
];

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
  active: "bg-teal-500/30 border-teal-400/60 text-teal-300 ring-2 ring-teal-400/30",
  upcoming: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  free: "bg-white/5 border-white/10 text-white/30",
  urgent: "bg-amber-500/20 border-amber-500/40 text-amber-400",
};

const receptionistQueue = [
  {
    name: "Ananya Sharma",
    age: 34,
    time: "09:00 AM",
    reason: "Annual Physical Exam",
    insurance: "Star Health Gold",
    status: "Checked Out",
    color: "#22c55e",
  },
  {
    name: "Vikram Desai",
    age: 58,
    time: "09:30 AM",
    reason: "Hypertension Follow-up (BP: 142/88 last visit)",
    insurance: "ICICI Lombard",
    status: "Checked Out",
    color: "#22c55e",
  },
  {
    name: "Priya Nair",
    age: 27,
    time: "10:00 AM",
    reason: "New Patient - Persistent migraine, 2 weeks",
    insurance: "HDFC Ergo",
    status: "With Doctor",
    color: "#6366f1",
  },
  {
    name: "Rohan Kapoor",
    age: 45,
    time: "11:00 AM",
    reason: "Diabetes Review - HbA1c & fasting glucose results",
    insurance: "Bajaj Allianz",
    status: "Waiting",
    color: "#f59e0b",
  },
  {
    name: "Fatima Khan",
    age: 62,
    time: "11:30 AM",
    reason: "Acute - Chest tightness, shortness of breath",
    insurance: "National Insurance",
    status: "Urgent",
    color: "#ef4444",
  },
];

export function LandingClient() {
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState<"receptionist" | "doctor">("receptionist");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="landing-root">
      {/* ── Sticky Nav ── */}
      <header
        className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}
      >
        <div className="landing-nav-inner">
          <Link href="/" className="landing-logo">
            <div className="landing-logo-icon">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <span>RecepForge</span>
          </Link>
          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#roles">For&nbsp;Teams</a>
          </nav>
          <div className="landing-nav-actions">
            <Link href="/sign-in" className="landing-nav-signin">
              Sign In
            </Link>
            <Link href="/sign-up" className="landing-cta-sm">
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-glow landing-hero-glow--1" />
        <div className="landing-hero-glow landing-hero-glow--2" />

        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <div className="landing-badge">
              <Shield size={14} />
              <span>HIPAA-Ready Clinic Management</span>
            </div>
            <h1>
              Your Clinic,
              <br />
              <span className="landing-gradient-text">Streamlined.</span>
            </h1>
            <p>
              Role-based dashboards for receptionists and doctors. Manage
              appointments, patient records, and clinical notes - all in one
              secure, intuitive platform.
            </p>
            <div className="landing-hero-actions">
              <Link href="/sign-up" className="landing-cta-primary">
                Start Free Trial
                <ArrowRight size={18} />
              </Link>
              <Link href="/sign-in" className="landing-cta-ghost">
                Already have an account? <ChevronRight size={14} />
              </Link>
            </div>
            <div className="landing-hero-stats">
              <div>
                <strong>99.9%</strong>
                <span>Uptime</span>
              </div>
              <div className="landing-hero-stats-divider" />
              <div>
                <strong>&lt;2s</strong>
                <span>Load Time</span>
              </div>
              <div className="landing-hero-stats-divider" />
              <div>
                <strong>AES-256</strong>
                <span>Encryption</span>
              </div>
            </div>
          </div>

          {/* Right mockup - realistic clinic schedule */}
          <div className="landing-hero-mockup">
            <div className="mockup-window">
              <div className="mockup-titlebar">
                <div className="mockup-dots">
                  <span style={{ background: "#ff5f57" }} />
                  <span style={{ background: "#febc2e" }} />
                  <span style={{ background: "#28c840" }} />
                </div>
                <span className="mockup-title">RecepForge - Dr. Mehta&apos;s Schedule</span>
              </div>
              <div className="mockup-body">
                <div className="mockup-topbar">
                  <div className="mockup-topbar-left">
                    <Calendar size={14} />
                    <span>Thursday, Apr 3, 2026</span>
                  </div>
                  <div className="mockup-topbar-right">
                    <span className="mockup-stat">
                      <span className="mockup-stat-dot" style={{ background: "#22c55e" }} />
                      2 Done
                    </span>
                    <span className="mockup-stat">
                      <span className="mockup-stat-dot" style={{ background: "#6366f1" }} />
                      1 In Visit
                    </span>
                    <span className="mockup-stat">
                      <span className="mockup-stat-dot" style={{ background: "#3b82f6" }} />
                      2 Upcoming
                    </span>
                  </div>
                </div>
                <div className="mockup-schedule">
                  {calendarSlots.map((slot) => (
                    <div
                      key={slot.time}
                      className={`mockup-slot ${statusColors[slot.status]}`}
                    >
                      <span className="mockup-slot-time">{slot.time}</span>
                      <span className="mockup-slot-patient">{slot.patient}</span>
                      {slot.status !== "free" && (
                        <span className="mockup-slot-tag">{slot.type}</span>
                      )}
                      {slot.status === "free" && slot.type !== "Available" && (
                        <span className="mockup-slot-tag" style={{ fontStyle: "italic" }}>{slot.type}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating notification */}
            <div className="mockup-notification">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <div>
                <strong>Lab Results Ready</strong>
                <span>Rohan Kapoor - HbA1c: 6.8%, FBS: 118 mg/dL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Strip ── */}
      <section className="landing-social-proof">
        <p>Trusted by leading healthcare providers</p>
        <div className="landing-logos">
          {clinics.map((name) => (
            <div key={name} className="landing-logo-pill">
              <div className="landing-logo-pill-icon">
                <Stethoscope size={14} />
              </div>
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-features">
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <Zap size={14} />
            Core Platform
          </div>
          <h2>Everything your clinic needs</h2>
          <p>
            Purpose-built for Indian clinics - from OPD scheduling to clinical documentation.
          </p>
        </div>
        <div className="landing-features-grid">
          {[
            {
              icon: Calendar,
              title: "OPD Scheduling",
              desc: "Book, reschedule, and manage appointments across multiple doctors. Conflict detection prevents double-bookings. Color-coded by visit type (Follow-up, New Patient, Urgent).",
              accent: "#3b82f6",
            },
            {
              icon: Users,
              title: "Patient Registry",
              desc: "Complete patient profiles with demographics, Aadhaar/insurance details, emergency contacts, medical history, allergies, and visit timeline - searchable in seconds.",
              accent: "#22c55e",
            },
            {
              icon: Stethoscope,
              title: "Doctor Workspace",
              desc: "Today's patient list, one-click visit start, and structured clinical note templates (SOAP, General Checkup, Follow-up). Patient history sidebar always visible.",
              accent: "#8b5cf6",
            },
            {
              icon: Shield,
              title: "Role-Based Access Control",
              desc: "Receptionists manage scheduling and check-ins. Doctors access clinical notes and prescriptions. Admins see audit logs. Zero data leakage between roles.",
              accent: "#f59e0b",
            },
            {
              icon: ClipboardList,
              title: "Clinical Notes & Templates",
              desc: "SOAP-format notes, chief complaint, assessment, and treatment plan. Auto-populated templates for common visits. Draft → Finalize workflow with full revision history.",
              accent: "#f43f5e",
            },
            {
              icon: Activity,
              title: "Real-Time Sync",
              desc: "Every appointment update, patient check-in, and note change syncs instantly across all devices. No page refreshes - powered by Convex real-time database.",
              accent: "#06b6d4",
            },
          ].map((f) => (
            <div key={f.title} className="landing-feature-card">
              <div
                className="landing-feature-icon"
                style={{ background: `${f.accent}15`, color: f.accent }}
              >
                <f.icon size={22} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role Split ── */}
      <section id="roles" className="landing-roles">
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <Users size={14} />
            Role-Based Design
          </div>
          <h2>Built for your whole team</h2>
          <p>
            Every team member gets a purpose-built interface designed for their daily workflow.
          </p>
        </div>

        <div className="landing-roles-tabs">
          <button
            className={`landing-roles-tab ${activeRole === "receptionist" ? "landing-roles-tab--active" : ""}`}
            onClick={() => setActiveRole("receptionist")}
          >
            <Users size={16} />
            Receptionist View
          </button>
          <button
            className={`landing-roles-tab ${activeRole === "doctor" ? "landing-roles-tab--active" : ""}`}
            onClick={() => setActiveRole("doctor")}
          >
            <Stethoscope size={16} />
            Doctor View
          </button>
        </div>

        <div className="landing-roles-panel">
          {activeRole === "receptionist" ? (
            <div className="landing-role-content animate-fade-in" key="rec">
              <div className="landing-role-info">
                <h3>The front desk, supercharged</h3>
                <ul>
                  <li>
                    <Calendar size={16} className="text-teal-400" />
                    <div>
                      <strong>One-Click Scheduling</strong>
                      <span>Book appointments with auto-conflict detection. See all doctors&apos; availability on one screen. SMS reminders sent automatically 24h before the visit.</span>
                    </div>
                  </li>
                  <li>
                    <Users size={16} className="text-teal-400" />
                    <div>
                      <strong>Patient Check-in & Registration</strong>
                      <span>Register walk-ins in under 60 seconds. Capture Aadhaar, insurance policy, emergency contact, and medical alerts. Returning patients auto-populate.</span>
                    </div>
                  </li>
                  <li>
                    <Clock size={16} className="text-teal-400" />
                    <div>
                      <strong>Live Appointment Queue</strong>
                      <span>Real-time status board: Scheduled → Checked In → Waiting → With Doctor → Checked Out. Average wait time and patient count always visible.</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="landing-role-mockup">
                <div className="role-mock-card">
                  <div className="role-mock-header">
                    <Calendar size={14} />
                    <span>Today&apos;s OPD Queue - Dr. Mehta</span>
                    <span className="role-mock-count">{receptionistQueue.length} patients</span>
                  </div>
                  {receptionistQueue.map((p) => (
                    <div key={p.name} className="role-mock-row">
                      <div className="role-mock-avatar">{p.name[0]}</div>
                      <div className="role-mock-info">
                        <span className="role-mock-name">{p.name}, {p.age}y</span>
                        <span className="role-mock-time">{p.time} · {p.insurance}</span>
                      </div>
                      <span
                        className="role-mock-status"
                        style={{ color: p.color, background: `${p.color}15` }}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                  <div className="role-mock-footer">
                    <span>Avg. wait: 12 min</span>
                    <span>Next available slot: 12:30 PM</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="landing-role-content animate-fade-in" key="doc">
              <div className="landing-role-info">
                <h3>Clinical workspace, simplified</h3>
                <ul>
                  <li>
                    <FileText size={16} className="text-blue-400" />
                    <div>
                      <strong>SOAP Clinical Notes</strong>
                      <span>Structured Subjective-Objective-Assessment-Plan format. Pre-filled templates for General Checkup, Follow-up, New Complaint, and Pediatric visits.</span>
                    </div>
                  </li>
                  <li>
                    <Heart size={16} className="text-blue-400" />
                    <div>
                      <strong>Patient History Sidebar</strong>
                      <span>Past visit notes, active medications (Metformin 500mg, Amlodipine 5mg), known allergies (Penicillin), and chronic conditions (Type 2 DM, HTN) - always one glance away.</span>
                    </div>
                  </li>
                  <li>
                    <Clock size={16} className="text-blue-400" />
                    <div>
                      <strong>One-Tap Visit Flow</strong>
                      <span>Start Visit → Write Notes → Add Prescription → Complete &amp; Finalize. Auto-timestamps each step. Draft saves every 30 seconds.</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="landing-role-mockup">
                <div className="role-mock-card role-mock-card--doctor">
                  <div className="role-mock-header">
                    <FileText size={14} />
                    <span>Clinical Note - Priya Nair, 27F</span>
                    <span className="role-mock-count">New Patient Consult</span>
                  </div>
                  <div className="role-mock-note">
                    <div className="role-mock-note-section">
                      <span className="role-mock-note-label">Subjective</span>
                      <p className="role-mock-note-text">
                        Patient presents with persistent migraine headaches × 2 weeks.
                        Pain is bilateral, throbbing, rated 7/10. Associated with nausea
                        and photophobia. No aura. OTC ibuprofen provides partial relief.
                        No recent head trauma. Family history of migraine (mother).
                      </p>
                    </div>
                    <div className="role-mock-note-section">
                      <span className="role-mock-note-label">Assessment</span>
                      <p className="role-mock-note-text">
                        Migraine without aura (ICD-10: G43.009). Rule out tension-type
                        headache. No red flags for secondary causes.
                      </p>
                    </div>
                    <div className="role-mock-note-section">
                      <span className="role-mock-note-label">Plan</span>
                      <p className="role-mock-note-text">
                        1. Start Sumatriptan 50mg PRN for acute episodes<br/>
                        2. Maintain headache diary for 4 weeks<br/>
                        3. CBC, Thyroid panel ordered<br/>
                        4. Follow-up in 4 weeks. Return sooner if vision changes.
                      </p>
                    </div>
                  </div>
                  <div className="role-mock-note-pills">
                    <span className="role-mock-pill role-mock-pill--rx">
                      <Pill size={12} /> Sumatriptan 50mg
                    </span>
                    <span className="role-mock-pill role-mock-pill--lab">
                      <Thermometer size={12} /> CBC + TSH ordered
                    </span>
                    <span className="role-mock-pill role-mock-pill--fu">
                      <Calendar size={12} /> F/U: May 1, 2026
                    </span>
                  </div>
                  <div className="role-mock-note-actions">
                    <span className="role-mock-btn role-mock-btn--outline">Save Draft</span>
                    <span className="role-mock-btn role-mock-btn--solid">Complete &amp; Finalize</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta-section">
        <div className="landing-cta-inner">
          <h2>Ready to streamline your clinic?</h2>
          <p>
            Join clinics that have cut front-desk admin time by 40% and reduced
            patient no-shows with automated reminders and smart scheduling.
          </p>
          <Link href="/sign-up" className="landing-cta-primary landing-cta-primary--lg">
            Start Your Free Trial
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Activity size={18} className="text-teal-400" />
            <span>RecepForge</span>
          </div>
          <p>© {new Date().getFullYear()} RecepForge. Built for better healthcare.</p>
        </div>
      </footer>
    </div>
  );
}
