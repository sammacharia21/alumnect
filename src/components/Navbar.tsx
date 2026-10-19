"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    role: "MENTOR" | "MENTEE" | "ADMIN";
    profile?: { fullName?: string; department?: string; jobTitle?: string } | null;
  } | null>(null);

  const fetchUser = () => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUser(data.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link href="/" className="brand">
          <span>✈️ Alumnect</span>
          <span className="brand-badge">SBERT pgvector</span>
        </Link>

        <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Guest / Visitor Nav */}
          {!user && (
            <>
              <Link href="/recommendations" className="nav-item">
                Explore Mentors
              </Link>
              <Link href="/login" className="nav-item" style={{ fontWeight: 600 }}>
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem", textDecoration: "none" }}
              >
                Join Platform
              </Link>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.8rem",
                  color: "#10b981",
                  fontWeight: 600,
                  background: "#ecfdf5",
                  padding: "0.3rem 0.65rem",
                  borderRadius: "9999px",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                  }}
                ></span>
                498 Vectors Live
              </div>
            </>
          )}

          {/* Authenticated Mentee Nav */}
          {user && user.role === "MENTEE" && (
            <>
              <Link
                href="/dashboard/mentee"
                className={`nav-item ${pathname === "/dashboard/mentee" ? "active" : ""}`}
                style={{ fontWeight: 600 }}
              >
                Explore Mentors
              </Link>
              <Link
                href="/dashboard/mentee/requests"
                className={`nav-item ${pathname.includes("/requests") ? "active" : ""}`}
              >
                My Requests
              </Link>
              <Link
                href="/dashboard/mentee/profile"
                className={`nav-item ${pathname.includes("/profile") ? "active" : ""}`}
              >
                My Profile
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "0.5rem" }}>
                <span
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "9999px",
                  }}
                >
                  🎓 {user.profile?.fullName || user.email.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}

          {/* Authenticated Mentor Nav */}
          {user && user.role === "MENTOR" && (
            <>
              <Link
                href="/dashboard/mentor"
                className={`nav-item ${pathname === "/dashboard/mentor" ? "active" : ""}`}
                style={{ fontWeight: 600 }}
              >
                Mentor Dashboard
              </Link>
              <Link
                href="/dashboard/mentor/requests"
                className={`nav-item ${pathname.includes("/requests") ? "active" : ""}`}
              >
                Inbound Requests
              </Link>
              <Link
                href="/dashboard/mentor/profile"
                className={`nav-item ${pathname.includes("/profile") ? "active" : ""}`}
              >
                My Profile
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "0.5rem" }}>
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#b45309",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "9999px",
                  }}
                >
                  ✈️ {user.profile?.fullName || user.email.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}

          {/* Authenticated Admin Nav */}
          {user && user.role === "ADMIN" && (
            <>
              <Link
                href="/admin/dashboard"
                className={`nav-item ${pathname === "/admin/dashboard" ? "active" : ""}`}
                style={{ fontWeight: 600 }}
              >
                Control Center
              </Link>
              <Link
                href="/admin/users"
                className={`nav-item ${pathname.includes("/users") ? "active" : ""}`}
              >
                User Directory
              </Link>
              <Link
                href="/admin/requests"
                className={`nav-item ${pathname.includes("/requests") ? "active" : ""}`}
              >
                Global Requests
              </Link>
              <Link
                href="/admin/engine"
                className={`nav-item ${pathname.includes("/engine") ? "active" : ""}`}
              >
                ML Diagnostics
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "0.5rem" }}>
                <span
                  style={{
                    background: "#ede9fe",
                    color: "#6d28d9",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "9999px",
                  }}
                >
                  🛡️ Administrator
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

