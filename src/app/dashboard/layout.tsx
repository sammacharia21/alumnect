"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; role: string; profile?: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUser(data.data);
          // If no profile, enforce onboarding
          if (!data.data.profile && !pathname.includes("/onboarding")) {
            router.push("/onboarding");
          }
        } else {
          // Fallback demo user if not logged in
          setUser({
            id: "4ce8f4d9-b75b-4927-bc17-737f62e4e780",
            email: "user.mentee@alumnect.dev",
            role: pathname.includes("/mentor") ? "MENTOR" : "MENTEE",
            profile: {
              fullName: pathname.includes("/mentor") ? "Capt. Layla Otieno" : "Amina Maina",
              department: "Flight Operations",
              jobTitle: pathname.includes("/mentor") ? "Line Check Airman" : "First Officer",
            },
          });
        }
      })
      .catch(() => {
        setUser({
          id: "4ce8f4d9-b75b-4927-bc17-737f62e4e780",
          email: "demo@alumnect.dev",
          role: pathname.includes("/mentor") ? "MENTOR" : "MENTEE",
        });
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const isMentor = pathname.startsWith("/dashboard/mentor");
  const isMentee = pathname.startsWith("/dashboard/mentee");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem", minHeight: "80vh" }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          background: "white",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-sm)",
          height: "fit-content",
          position: "sticky",
          top: "5rem",
        }}
      >
        <div>
          {/* User Info Capsule */}
          <div style={{ paddingBottom: "1.25rem", borderBottom: "1px solid var(--color-border)", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
              Logged in as:
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-navy)", marginTop: "0.2rem" }}>
              {user?.profile?.fullName || (isMentor ? "Aviation Mentor" : "Aviation Mentee")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.4rem" }}>
              <span
                style={{
                  background: isMentor ? "#fef3c7" : "var(--color-primary-light)",
                  color: isMentor ? "#b45309" : "var(--color-primary)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {isMentor ? "✈️ MENTOR" : "🎓 MENTEE"}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                {user?.profile?.department ? user.profile.department.split(" ")[0] : "Aviation"}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {/* Mentee Links */}
            {!isMentor && (
              <>
                <Link
                  href="/dashboard/mentee"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    background: pathname === "/dashboard/mentee" ? "var(--color-primary-light)" : "transparent",
                    color: pathname === "/dashboard/mentee" ? "var(--color-primary)" : "var(--color-text)",
                  }}
                >
                  🔍 Discover Mentors
                </Link>
                <Link
                  href="/dashboard/mentee/requests"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    background: pathname === "/dashboard/mentee/requests" ? "var(--color-primary-light)" : "transparent",
                    color: pathname === "/dashboard/mentee/requests" ? "var(--color-primary)" : "var(--color-text)",
                  }}
                >
                  📤 My Requests
                </Link>
                <Link
                  href="/dashboard/mentee/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    background: pathname === "/dashboard/mentee/profile" ? "var(--color-primary-light)" : "transparent",
                    color: pathname === "/dashboard/mentee/profile" ? "var(--color-primary)" : "var(--color-text)",
                  }}
                >
                  👤 Mentee Profile & Bio
                </Link>
              </>
            )}

            {/* Mentor Links */}
            {isMentor && (
              <>
                <Link
                  href="/dashboard/mentor"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    background: pathname === "/dashboard/mentor" ? "#fef3c7" : "transparent",
                    color: pathname === "/dashboard/mentor" ? "#b45309" : "var(--color-text)",
                  }}
                >
                  📊 Mentor Overview
                </Link>
                <Link
                  href="/dashboard/mentor/requests"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    background: pathname === "/dashboard/mentor/requests" ? "#fef3c7" : "transparent",
                    color: pathname === "/dashboard/mentor/requests" ? "#b45309" : "var(--color-text)",
                  }}
                >
                  📥 Inbound Requests
                </Link>
                <Link
                  href="/dashboard/mentor/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    background: pathname === "/dashboard/mentor/profile" ? "#fef3c7" : "transparent",
                    color: pathname === "/dashboard/mentor/profile" ? "#b45309" : "var(--color-text)",
                  }}
                >
                  👤 Profile & Availability
                </Link>
              </>
            )}

            {/* Quick Role Switcher for paired testing */}
            <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-light)", display: "block", marginBottom: "0.4rem", fontWeight: 700 }}>
                ROLE VIEW SWITCHER:
              </span>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <Link
                  href="/dashboard/mentee"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: "0.75rem",
                    padding: "0.3rem",
                    borderRadius: "var(--radius-sm)",
                    background: !isMentor ? "var(--color-primary-light)" : "#f1f5f9",
                    color: !isMentor ? "var(--color-primary)" : "var(--color-text-muted)",
                    fontWeight: 700,
                  }}
                >
                  Mentee
                </Link>
                <Link
                  href="/dashboard/mentor"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: "0.75rem",
                    padding: "0.3rem",
                    borderRadius: "var(--radius-sm)",
                    background: isMentor ? "#fef3c7" : "#f1f5f9",
                    color: isMentor ? "#b45309" : "var(--color-text-muted)",
                    fontWeight: 700,
                  }}
                >
                  Mentor
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer Actions */}
        <div style={{ paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--color-danger)",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section style={{ minWidth: 0 }}>{children}</section>
    </div>
  );
}

