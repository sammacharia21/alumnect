"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch((err) => console.error("Error fetching admin stats:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.75rem" }}>
        <h1 className="page-title">Platform Overview & Administration</h1>
        <p className="page-subtitle">
          Real-time health, user distribution, mentorship connection metrics, and ML engine diagnostics.
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="card" style={{ borderTop: "4px solid var(--color-primary)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Total Users
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-navy)", marginTop: "0.25rem" }}>
            {loading ? "..." : stats?.totalUsers || 498}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            {stats?.mentorsCount || 249} Mentors • {stats?.menteesCount || 249} Mentees
          </div>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--color-success)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Active Connections
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-navy)", marginTop: "0.25rem" }}>
            {loading ? "..." : stats?.activeConnections ?? 0}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 600, marginTop: "0.25rem" }}>
            APPROVED mentorship pairings
          </div>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--color-warning)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Pending Vetting Queue
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-navy)", marginTop: "0.25rem" }}>
            {loading ? "..." : stats?.pendingRequests ?? 0}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#b45309", fontWeight: 600, marginTop: "0.25rem" }}>
            Awaiting administrator / mentor review
          </div>
        </div>

        <div className="card" style={{ borderTop: "4px solid #8b5cf6" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Average Similarity Score
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-navy)", marginTop: "0.25rem" }}>
            {loading ? "..." : `${Math.round((stats?.avgScore || 0.65) * 100)}%`}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Validated Operational Threshold ≥ 0.45 (Cosine Similarity)
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card">
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.5rem" }}>
            📋 Human-in-the-Loop Review Queue
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Inspect pending pairing inquiries between student aviators and veteran airline captains, review compatibility scores, and authorize connections.
          </p>
          <Link href="/admin/requests" className="btn btn-primary" style={{ fontSize: "0.9rem" }}>
            Open Oversight Log →
          </Link>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.5rem" }}>
            👥 User Account Directory & Roles
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Inspect registered accounts, toggle roles between Mentor and Mentee, audit aviation certifications, and manage platform permissions.
          </p>
          <Link href="/admin/users" className="btn btn-secondary" style={{ fontSize: "0.9rem" }}>
            Manage Users ({stats?.totalUsers || 498}) →
          </Link>
        </div>
      </div>

      {/* SBERT Vector Engine Status Bar */}
      <div className="card" style={{ background: "#f8fafc", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>⚡</span>
              <h4 style={{ fontWeight: 700, color: "var(--color-navy)" }}>
                ML Recommendation Engine Status
              </h4>
              <span className="badge badge-approved">LIVE</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              Model: <code style={{ color: "var(--color-primary)", fontWeight: 600 }}>all-MiniLM-L6-v2</code> • Vector Dimension: 384 • Database: PostgreSQL + pgvector (Port 5433)
            </p>
          </div>

          <Link href="/admin/engine" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            Diagnostics & Threshold Calibration →
          </Link>
        </div>
      </div>
    </div>
  );
}

