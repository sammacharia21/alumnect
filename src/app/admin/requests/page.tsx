"use client";

import React, { useState, useEffect } from "react";
import type { MentorshipRequestRecord } from "@/types";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<MentorshipRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = filter === "ALL" ? "/api/requests" : `/api/requests?status=${filter}`;
      const res = await fetch(url);
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

  const handleStatusUpdate = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(requestId);
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">Global Mentorship Requests Oversight</h1>
        <p className="page-subtitle">
          Human-in-the-loop review queue for all AI-generated pairings, student requests, and mentor approvals.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          All Requests ({requests.length})
        </button>
        <button
          className={`tab-btn ${filter === "PENDING" ? "active" : ""}`}
          onClick={() => setFilter("PENDING")}
        >
          Pending Review
        </button>
        <button
          className={`tab-btn ${filter === "APPROVED" ? "active" : ""}`}
          onClick={() => setFilter("APPROVED")}
        >
          Approved Connections
        </button>
        <button
          className={`tab-btn ${filter === "REJECTED" ? "active" : ""}`}
          onClick={() => setFilter("REJECTED")}
        >
          Declined
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Loading mentorship requests log...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            No mentorship requests found in this view.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {requests.map((req) => {
            const scorePct = Math.round(req.similarityScore * 100);
            const statusClass =
              req.status === "APPROVED"
                ? "badge-approved"
                : req.status === "REJECTED"
                ? "badge-rejected"
                : "badge-pending";

            return (
              <div key={req.id} className="card">
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span className="score-pill score-high">★ {scorePct}% Match</span>
                    <span className={`badge ${statusClass}`}>{req.status}</span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-light)" }}>
                    {new Date(req.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Side-by-Side Mentee & Mentor Comparison */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1rem" }}>
                  {/* Mentee Side */}
                  <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase" }}>
                      MENTEE APPLICANT:
                    </span>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-navy)", marginTop: "0.2rem" }}>
                      {req.mentee?.profile?.fullName || "Mentee"}
                    </h4>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
                      {req.mentee?.profile?.jobTitle} • {req.mentee?.profile?.department} ({req.mentee?.profile?.yearsExperience ?? 0} yrs)
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--color-text)", lineHeight: 1.45 }}>
                      {req.mentee?.profile?.rawBio || "No bio narrative provided."}
                    </p>
                  </div>

                  {/* Mentor Side */}
                  <div style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid #bbf7d0" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#16a34a", textTransform: "uppercase" }}>
                      MATCHED MENTOR:
                    </span>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-navy)", marginTop: "0.2rem" }}>
                      {req.mentor?.profile?.fullName || "Mentor"}
                    </h4>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
                      {req.mentor?.profile?.jobTitle} • {req.mentor?.profile?.department} ({req.mentor?.profile?.yearsExperience ?? 0} yrs)
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--color-text)", lineHeight: 1.45, marginBottom: "0.4rem" }}>
                      {req.mentor?.profile?.rawBio || "No bio narrative provided."}
                    </p>
                    {req.mentor?.profile?.certifications && (
                      <div style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: 600 }}>
                        Certs: {req.mentor.profile.certifications}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {req.notes && (
                  <div style={{ background: "#ffffff", border: "1px solid var(--color-border)", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-light)", display: "block" }}>
                      APPLICANT INQUIRY MESSAGE:
                    </span>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text)", fontStyle: "italic", marginTop: "0.15rem" }}>
                      "{req.notes}"
                    </p>
                  </div>
                )}

                {/* Admin Override Controls */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
                  {req.status !== "REJECTED" && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={actionLoading === req.id}
                      onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                      style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                    >
                      Administrative Decline
                    </button>
                  )}
                  {req.status !== "APPROVED" && (
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={actionLoading === req.id}
                      onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                      style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                    >
                      Authorize Connection
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

