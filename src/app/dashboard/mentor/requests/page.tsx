"use client";

import React, { useState, useEffect } from "react";
import type { MentorshipRequestRecord } from "@/types";

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState<MentorshipRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      const mentorId = meData?.data?.id;

      const url = mentorId ? `/api/requests?userId=${mentorId}&role=mentor` : "/api/requests";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error("Error loading mentor requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(requestId);
    try {
      let feedbackNote = "";
      if (status === "REJECTED") {
        feedbackNote = prompt("Optional: Provide a brief reason or feedback for the mentee:") || "";
      }

      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status,
          notes: feedbackNote ? `Mentor note: ${feedbackNote}` : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error("Decision update failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">Inbound Mentorship Requests Queue</h1>
        <p className="page-subtitle">
          Review candidate bios, verify semantic compatibility scores, and accept or decline mentorship pairings.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${filter === "PENDING" ? "active" : ""}`}
          onClick={() => setFilter("PENDING")}
        >
          Pending Inquiries ({pendingCount})
        </button>
        <button
          className={`tab-btn ${filter === "APPROVED" ? "active" : ""}`}
          onClick={() => setFilter("APPROVED")}
        >
          Active Mentees ({requests.filter((r) => r.status === "APPROVED").length})
        </button>
        <button
          className={`tab-btn ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          All History ({requests.length})
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Loading requests queue...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            No requests currently in the {filter.toLowerCase()} list.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {filteredRequests.map((req) => {
            const matchScore = Math.round(req.similarityScore * 100);
            const statusClass =
              req.status === "APPROVED"
                ? "badge-approved"
                : req.status === "REJECTED"
                ? "badge-rejected"
                : "badge-pending";

            return (
              <div key={req.id} className="card">
                {/* Header with Name & Match Score */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.85rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-navy)" }}>
                      {req.mentee?.profile?.fullName || "Mentee Candidate"}
                    </h3>
                    <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginTop: "0.1rem" }}>
                      {req.mentee?.profile?.jobTitle} • {req.mentee?.profile?.department} ({req.mentee?.profile?.yearsExperience ?? 0} yrs experience)
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="score-pill score-high">★ {matchScore}% Match</span>
                    <span className={`badge ${statusClass}`}>{req.status}</span>
                  </div>
                </div>

                {/* Mentee Introduction Note */}
                {req.notes && (
                  <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "0.85rem", borderLeft: "3px solid var(--color-primary)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", display: "block", marginBottom: "0.2rem" }}>
                      MENTEE'S INTRODUCTION MESSAGE:
                    </span>
                    <p style={{ fontSize: "0.9rem", color: "var(--color-text)" }}>"{req.notes}"</p>
                  </div>
                )}

                {/* Mentee Background Narrative */}
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", display: "block", marginBottom: "0.25rem" }}>
                    MENTEE CAREER NARRATIVE (SBERT EMBEDDED):
                  </span>
                  <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                    {req.mentee?.profile?.rawBio || "No bio provided."}
                  </p>
                </div>

                {/* Approved State: Mentee Contact Details */}
                {req.status === "APPROVED" && (
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#065f46", display: "block" }}>
                      CONNECTED MENTEE CONTACT:
                    </span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 600, color: "#047857" }}>
                      📧 {req.mentee?.email}
                    </span>
                  </div>
                )}

                {/* Action Controls for Pending Inquiries */}
                {req.status === "PENDING" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.85rem" }}>
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={actionLoading === req.id}
                      onClick={() => handleDecision(req.id, "REJECTED")}
                    >
                      ✕ Decline
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={actionLoading === req.id}
                      onClick={() => handleDecision(req.id, "APPROVED")}
                    >
                      ✓ Accept Mentorship Request
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

