"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(true);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2rem", minHeight: "85vh" }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          background: "var(--color-navy)",
          color: "white",
          borderRadius: "var(--radius-md)",
          padding: "1.75rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-md)",
          height: "fit-content",
          position: "sticky",
          top: "5rem",
        }}
      >
        <div>
          {/* Header */}
          <div style={{ paddingBottom: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.15)", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🛡️</span>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
                Admin Portal
              </span>
            </div>
            <div style={{ display: "inline-block", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px", marginTop: "0.5rem" }}>
              ● System Active (Port 5433)
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link
              href="/admin/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.92rem",
                fontWeight: 600,
                background: pathname === "/admin/dashboard" ? "rgba(255,255,255,0.18)" : "transparent",
                color: "white",
              }}
            >
              📊 Platform Overview
            </Link>

            <Link
              href="/admin/users"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.92rem",
                fontWeight: 600,
                background: pathname === "/admin/users" ? "rgba(255,255,255,0.18)" : "transparent",
                color: "white",
              }}
            >
              👥 User Management
            </Link>

            <Link
              href="/admin/requests"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.92rem",
                fontWeight: 600,
                background: pathname === "/admin/requests" ? "rgba(255,255,255,0.18)" : "transparent",
                color: "white",
              }}
            >
              📋 Mentorship Oversight
            </Link>

            <Link
              href="/admin/engine"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.92rem",
                fontWeight: 600,
                background: pathname === "/admin/engine" ? "rgba(255,255,255,0.18)" : "transparent",
                color: "white",
              }}
            >
              🧠 ML Engine Diagnostics
            </Link>
          </nav>
        </div>

        {/* Back Link */}
        <div style={{ paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: "1.5rem" }}>
          <Link
            href="/dashboard/mentee"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            ← Return to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <section style={{ minWidth: 0 }}>{children}</section>
    </div>
  );
}

