"use client";

import React, { useState, useEffect } from "react";

interface AdminMatchItem {
  id: string;
  menteeId: string;
  mentorId: string;
  similarityScore: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes?: string;
  createdAt: string;
  mentee: {
    id: string;
    email: string;
    role: string;
    profile?: {
      fullName: string;
      department: string;
      jobTitle: string;
      yearsExperience: number;
      certifications: string;
      rawBio: string;
    } | null;
  };
  mentor: {
    id: string;
    email: string;
    role: string;
    profile?: {
      fullName: string;
      department: string;
      jobTitle: string;
      yearsExperience: number;
      certifications: string;
      rawBio: string;
    } | null;
  };
}

export default function AdminReviewPage() {
  const [matches, setMatches] = useState<AdminMatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/matches");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMatches(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (matchId: string, approved: boolean) => {
    setActionLoading(matchId);
    try {
      const res = await fetch("/api/admin/matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, approved }),
      });
      const data = await res.json();
      if (data.success) {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId
              ? { ...m, status: approved ? "APPROVED" : "REJECTED" }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Failed to submit decision:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (filter === "ALL") return true;
    return m.status === filter;
  });

  const pendingCount = matches.filter((m) => m.status === "PENDING").length;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title">Admin Human-in-the-Loop Review</h1>
            <p className="page-subtitle">
              Verify AI-generated matches, review mentee compatibility, and approve mentorship pairings
            </p>
          </div>

          <button type="button" className="btn btn-secondary" onClick={fetchMatches}>
            🔄 Refresh Queue ({pendingCount} Pending)
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${filter === "PENDING" ? "active" : ""}`}
          onClick={() => setFilter("PENDING")}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          className={`tab-btn ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          All Matches ({matches.length})
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Loading match requests...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            No matches found in the {filter.toLowerCase()} queue.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {filteredMatches.map((item) => {
            const matchScore = Math.round(item.similarityScore * 100);
            const statusClass =
              item.status === "APPROVED"
                ? "badge-approved"
                : item.status === "REJECTED"
                ? "badge-rejected"
                : "badge-pending";

            return (
              <div key={item.id} className="card">
                {/* Header with Match Score */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.85rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className="score-pill score-high">
                      ★ {matchScore}% Match
                    </span>
                    <span className={`badge ${statusClass}`}>{item.status}</span>
                  </div>

                  <span style={{ fontSize: "0.82rem", color: "var(--color-text-light)" }}>
                    Requested: {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Side-by-side Mentee & Mentor Comparison */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.25rem" }}>
                  {/* Mentee Side */}
                  <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                      Mentee Candidate
                    </div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy)" }}>
                      {item.mentee?.profile?.fullName || "Mentee"}
                    </h4>
                    <div style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                      {item.mentee?.profile?.jobTitle} • {item.mentee?.profile?.department} ({item.mentee?.profile?.yearsExperience ?? 0} yrs exp)
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text)", lineHeight: 1.45 }}>
                      {item.mentee?.profile?.rawBio || "No bio provided."}
                    </p>
                  </div>

                  {/* Mentor Side */}
                  <div style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                      Matched Mentor
                    </div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy)" }}>
                      {item.mentor?.profile?.fullName || "Mentor"}
                    </h4>
                    <div style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                      {item.mentor?.profile?.jobTitle} • {item.mentor?.profile?.department} ({item.mentor?.profile?.yearsExperience ?? 0} yrs exp)
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text)", lineHeight: 1.45, marginBottom: "0.5rem" }}>
                      {item.mentor?.profile?.rawBio || "No bio provided."}
                    </p>
                    {item.mentor?.profile?.certifications && (
                      <div style={{ fontSize: "0.78rem", color: "#15803d", fontWeight: 600 }}>
                        Certs: {item.mentor.profile.certifications}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mentee Notes */}
                {item.notes && (
                  <div style={{ background: "#ffffff", border: "1px solid var(--color-border)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", display: "block", marginBottom: "0.25rem" }}>
                      MENTEE STATEMENT OF PURPOSE / REQUEST NOTE:
                    </span>
                    <p style={{ fontSize: "0.9rem", color: "var(--color-text)", fontStyle: "italic" }}>
                      "{item.notes}"
                    </p>
                  </div>
                )}

                {/* Admin Actions */}
                {item.status === "PENDING" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDecision(item.id, false)}
                      disabled={actionLoading === item.id}
                    >
                      ✕ Reject Match
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleDecision(item.id, true)}
                      disabled={actionLoading === item.id}
                    >
                      ✓ Approve Match & Authorize Connection
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

