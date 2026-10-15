"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { MentorshipRequestRecord } from "@/types";

export default function MentorOverviewPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requests, setRequests] = useState<MentorshipRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCurrentUser(data.data);
          loadRequests(data.data.id);
        } else {
          // Demo fallback mentor ID
          loadRequests("bd5140b9-f7f6-4b32-a422-973e04f2de48");
        }
      })
      .catch(() => loadRequests("bd5140b9-f7f6-4b32-a422-973e04f2de48"));
  }, []);

  const loadRequests = async (mentorId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests?userId=${mentorId}&role=mentor`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const approvedRequests = requests.filter((r) => r.status === "APPROVED");

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.75rem" }}>
        <h1 className="page-title">Mentor Overview & Performance</h1>
        <p className="page-subtitle">
          Manage your incoming mentorship inquiries, active student connections, and aviation availability.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ borderLeft: "4px solid var(--color-warning)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Pending Inquiries
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-navy)", marginTop: "0.25rem" }}>
            {pendingRequests.length}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Awaiting your review
          </div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid var(--color-success)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Active Mentees
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-navy)", marginTop: "0.25rem" }}>
            {approvedRequests.length}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Approved connections
          </div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Avg. Match Score
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-navy)", marginTop: "0.25rem" }}>
            {requests.length > 0
              ? `${Math.round((requests.reduce((acc, r) => acc + r.similarityScore, 0) / requests.length) * 100)}%`
              : "68%"}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Across all candidate pairs
          </div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Profile Status
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#8b5cf6", marginTop: "0.5rem" }}>
            Active (384-D)
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Indexed in pgvector
          </div>
        </div>
      </div>

      {/* Incoming Requests Queue */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-navy)" }}>
          Incoming Connection Requests Queue
        </h2>
        <Link href="/dashboard/mentor/requests" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
          View Full Request Queue ({pendingRequests.length}) →
        </Link>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Loading requests queue...</p>
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            No pending mentorship requests in your queue right now.
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginTop: "0.35rem" }}>
            Mentees searching in your department will appear here automatically based on SBERT semantic matches.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {pendingRequests.slice(0, 3).map((req) => (
            <div key={req.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy)" }}>
                    {req.mentee?.profile?.fullName || "Mentee Candidate"}
                  </h3>
                  <span className="badge badge-pending">PENDING</span>
                  <span className="score-pill score-high">★ {Math.round(req.similarityScore * 100)}% Match</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  {req.mentee?.profile?.jobTitle} • {req.mentee?.profile?.department}
                </div>
                {req.notes && (
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text)", background: "#f8fafc", padding: "0.4rem 0.65rem", borderRadius: "var(--radius-sm)", marginTop: "0.4rem" }}>
                    "{req.notes}"
                  </p>
                )}
              </div>

              <Link href="/dashboard/mentor/requests" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                Review Request →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

