"use client";

import React, { useState, useEffect } from "react";
import type { MentorMatch, MentorshipRequestRecord } from "@/types";

const PRESET_QUERIES = [
  "Looking for an experienced Boeing B787 captain for flight operations and ICAO safety mentorship",
  "Aircraft maintenance engineer specialized in avionics, TCAS, and radar systems troubleshooting",
  "Air traffic controller or flight dispatcher with KCAA / FAA regulatory knowledge",
  "Commercial First Officer preparing for narrow-body B737 line conversion and simulator checks",
];

const DEPARTMENTS = [
  "ALL",
  "Flight Operations",
  "Technical and Maintenance Engineering",
  "Corporate and Airline Operations",
];

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState<"discover" | "sent" | "received">("discover");

  // Search parameters
  const [queryText, setQueryText] = useState(PRESET_QUERIES[0]);
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [threshold, setThreshold] = useState(0.45);
  const [limit, setLimit] = useState(8);

  // Search results & loading states
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Mentorship Requests state
  const [sentRequests, setSentRequests] = useState<MentorshipRequestRecord[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MentorshipRequestRecord[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Active simulated user for demo (using a mentee ID from seeded DB)
  const [currentMenteeId, setCurrentMenteeId] = useState("4ce8f4d9-b75b-4927-bc17-737f62e4e780");

  // Modal for submitting a mentorship request
  const [modalMentor, setModalMentor] = useState<MentorMatch | null>(null);
  const [requestNotes, setRequestNotes] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [modalFeedback, setModalFeedback] = useState("");

  // Fetch initial recommendations on load
  useEffect(() => {
    handleSearch();
    loadRequests();
  }, []);

  const handleSearch = async (overrideQuery?: string) => {
    const textToSearch = (overrideQuery ?? queryText).trim();
    if (!textToSearch) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/matches/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSearch,
          threshold,
          limit,
          department: selectedDept === "ALL" ? undefined : selectedDept,
        }),
      });

      const resData = await response.json();
      if (resData.success && Array.isArray(resData.data)) {
        setMatches(resData.data);
      } else {
        setErrorMessage(resData.error || "Failed to find matching mentors.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error connecting to recommendation service.");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      // 1. Sent requests for current mentee
      const sentRes = await fetch(`/api/requests?userId=${currentMenteeId}&role=mentee`);
      const sentData = await sentRes.json();
      if (sentData.success) {
        setSentRequests(sentData.data);
      }

      // 2. All requests (to simulate mentor inbox view)
      const allRes = await fetch("/api/requests");
      const allData = await allRes.json();
      if (allData.success) {
        setReceivedRequests(allData.data);
      }
    } catch (err) {
      console.error("Error loading requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const submitMentorshipRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMentor) return;

    setSubmittingRequest(true);
    setModalFeedback("");

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menteeId: currentMenteeId,
          mentorId: modalMentor.userId,
          similarityScore: modalMentor.similarity,
          notes: requestNotes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setModalFeedback("Request sent successfully!");
        setTimeout(() => {
          setModalMentor(null);
          setRequestNotes("");
          setModalFeedback("");
          loadRequests();
        }, 1200);
      } else {
        setModalFeedback(data.error || "Failed to submit request.");
      }
    } catch (err) {
      setModalFeedback(err instanceof Error ? err.message : "Submission error");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      const data = await res.json();
      if (data.success) {
        loadRequests();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Aviation Mentorship Matching Engine</h1>
        <p className="page-subtitle">
          Real-time SBERT embeddings + PostgreSQL pgvector dense retrieval (384 dimensions)
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "discover" ? "active" : ""}`}
          onClick={() => setActiveTab("discover")}
        >
          🔍 Discover Mentors ({matches.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("sent");
            loadRequests();
          }}
        >
          📤 Sent Requests ({sentRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("received");
            loadRequests();
          }}
        >
          📥 Mentor Inbox ({receivedRequests.length})
        </button>
      </div>

      {/* TAB 1: DISCOVER MENTORS */}
      {activeTab === "discover" && (
        <div>
          {/* Query & Filter Panel */}
          <section className="card" style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--color-navy)" }}>
              Mentee Background, Goals & Search Query
            </h2>

            <div style={{ marginBottom: "1rem" }}>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
                placeholder="Describe your current flying or engineering experience, aircraft type ratings, and what mentorship you need..."
              />
            </div>

            {/* Quick Prompt Presets */}
            <div style={{ marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginRight: "0.5rem" }}>
                Suggested Queries:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
                {PRESET_QUERIES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQueryText(preset);
                      handleSearch(preset);
                    }}
                    style={{
                      background: queryText === preset ? "var(--color-primary-light)" : "#f1f5f9",
                      color: queryText === preset ? "var(--color-primary)" : "var(--color-text)",
                      border: queryText === preset ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                      padding: "0.3rem 0.65rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                    }}
                  >
                    {preset.slice(0, 52)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Bar */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
              {/* Department Filter */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                  Department Filter
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  style={{
                    padding: "0.45rem 0.8rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    background: "white",
                  }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === "ALL" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Threshold Slider */}
              <div style={{ flex: "1", minWidth: "220px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  <span>Cosine Similarity Threshold:</span>
                  <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                    {threshold.toFixed(2)} (Validation Baseline: 0.45)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.80"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--color-primary)" }}
                />
              </div>

              {/* Limit */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                  Max Mentors
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  style={{
                    padding: "0.45rem 0.8rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    background: "white",
                  }}
                >
                  <option value={5}>Top 5</option>
                  <option value={8}>Top 8</option>
                  <option value={15}>Top 15</option>
                  <option value={25}>Top 25</option>
                </select>
              </div>

              {/* Search Button */}
              <div style={{ marginLeft: "auto", alignSelf: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSearch()}
                  disabled={loading}
                  style={{ minWidth: "150px" }}
                >
                  {loading ? "Matching Vectors..." : "⚡ Run AI Match"}
                </button>
              </div>
            </div>
          </section>

          {/* Results Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)" }}>
              Recommended Aviation Mentors
            </h3>
            <span style={{ fontSize: "0.88rem", color: "var(--color-text-muted)" }}>
              Showing {matches.length} candidates meeting threshold ≥ {threshold.toFixed(2)}
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
              {errorMessage}
            </div>
          )}

          {/* Match Results Grid */}
          {matches.length === 0 && !loading ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
                No mentors found meeting the cosine threshold of {threshold.toFixed(2)}.
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-light)", marginTop: "0.5rem" }}>
                Try broadening your query text or lowering the similarity threshold.
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {matches.map((mentor) => {
                const isHigh = mentor.compatibilityPercentage >= 70;
                const isGood = mentor.compatibilityPercentage >= 55;
                const scoreClass = isHigh ? "score-high" : isGood ? "score-good" : "score-fair";

                const certList = mentor.certifications
                  ? mentor.certifications.split(",").map((c) => c.trim()).filter(Boolean)
                  : [];

                return (
                  <article key={mentor.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)" }}>
                          {mentor.fullName}
                        </h4>
                        <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--color-primary)", marginTop: "0.1rem" }}>
                          {mentor.jobTitle}
                        </div>
                      </div>

                      {/* Compatibility Pill */}
                      <div className={`score-pill ${scoreClass}`} title={`Cosine Similarity: ${mentor.similarity}`}>
                        <span>★</span>
                        <span>{mentor.compatibilityPercentage}% Match</span>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.85rem" }}>
                      <span className="badge badge-dept">{mentor.department}</span>
                      <span className="badge" style={{ background: "#f8fafc", border: "1px solid var(--color-border)", color: "#334155" }}>
                        ⏱ {mentor.yearsExperience} yrs exp
                      </span>
                    </div>

                    {/* Bio Snippet */}
                    <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "1rem", flexGrow: 1 }}>
                      {mentor.rawBio}
                    </p>

                    {/* Certifications Tags */}
                    {certList.length > 0 && (
                      <div style={{ marginBottom: "1.25rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-light)", display: "block", marginBottom: "0.35rem" }}>
                          CERTIFICATIONS & RATINGS
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                          {certList.map((cert, cIdx) => (
                            <span
                              key={cIdx}
                              style={{
                                background: "#f1f5f9",
                                color: "#0f172a",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                padding: "0.2rem 0.5rem",
                                borderRadius: "var(--radius-sm)",
                              }}
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                      onClick={() => {
                        setModalMentor(mentor);
                        setRequestNotes(`Hi ${mentor.fullName}, I am interested in your mentorship regarding ${mentor.jobTitle.toLowerCase()} pathways.`);
                        setModalFeedback("");
                      }}
                    >
                      🤝 Request Mentorship
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SENT REQUESTS */}
      {activeTab === "sent" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-navy)" }}>
                Your Submitted Mentorship Requests
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                Tracking requests sent to aviation mentors with operational match scores
              </p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={loadRequests}>
              🔄 Refresh
            </button>
          </div>

          {requestsLoading ? (
            <p style={{ color: "var(--color-text-muted)" }}>Loading requests...</p>
          ) : sentRequests.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
                No mentorship requests submitted yet.
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-light)", marginTop: "0.5rem" }}>
                Switch to the "Discover Mentors" tab to match with veteran captains and engineers.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {sentRequests.map((req) => {
                const statusBadge =
                  req.status === "APPROVED"
                    ? "badge-approved"
                    : req.status === "REJECTED"
                    ? "badge-rejected"
                    : "badge-pending";

                const matchPct = Math.round(req.similarityScore * 100);

                return (
                  <div key={req.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy)" }}>
                          {req.mentor?.profile?.fullName || "Aviation Mentor"}
                        </h4>
                        <span className={`badge ${statusBadge}`}>{req.status}</span>
                        <span className="badge badge-dept">{matchPct}% Match</span>
                      </div>
                      <div style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                        {req.mentor?.profile?.jobTitle} • {req.mentor?.profile?.department}
                      </div>
                      {req.notes && (
                        <p style={{ fontSize: "0.85rem", color: "var(--color-text)", background: "#f8fafc", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--color-primary)" }}>
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-light)" }}>
                      Sent on {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MENTOR INBOX (RECEIVED REQUESTS) */}
      {activeTab === "received" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-navy)" }}>
                Mentor Inbox / Incoming Requests
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                Review incoming requests from mentees and approve connections
              </p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={loadRequests}>
              🔄 Refresh
            </button>
          </div>

          {receivedRequests.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
                No incoming mentorship requests.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {receivedRequests.map((req) => {
                const statusBadge =
                  req.status === "APPROVED"
                    ? "badge-approved"
                    : req.status === "REJECTED"
                    ? "badge-rejected"
                    : "badge-pending";

                return (
                  <div key={req.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.25rem" }}>
                    <div style={{ flex: "1", minWidth: "280px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy)" }}>
                          {req.mentee?.profile?.fullName || "Mentee Candidate"}
                        </h4>
                        <span className={`badge ${statusBadge}`}>{req.status}</span>
                        <span className="badge badge-dept">{Math.round(req.similarityScore * 100)}% Match</span>
                      </div>

                      <div style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
                        Target Mentor: <strong>{req.mentor?.profile?.fullName || req.mentorId}</strong> ({req.mentor?.profile?.jobTitle || "Mentor"})
                      </div>

                      {req.notes && (
                        <p style={{ fontSize: "0.85rem", color: "var(--color-text)", background: "#f8fafc", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--color-primary)" }}>
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    {req.status === "PENDING" && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => updateRequestStatus(req.id, "APPROVED")}
                        >
                          ✓ Accept Request
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => updateRequestStatus(req.id, "REJECTED")}
                        >
                          ✕ Decline
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: SUBMIT MENTORSHIP REQUEST */}
      {modalMentor && (
        <div className="modal-backdrop" onClick={() => setModalMentor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-navy)" }}>
                  Connect with {modalMentor.fullName}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)" }}>
                  {modalMentor.jobTitle} • {modalMentor.department} ({modalMentor.compatibilityPercentage}% Match)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMentor(null)}
                style={{ fontSize: "1.4rem", color: "var(--color-text-muted)", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitMentorshipRequest}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "0.4rem" }}>
                  Message / Mentorship Goal:
                </label>
                <textarea
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  rows={4}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    outline: "none",
                    lineHeight: 1.5,
                  }}
                  placeholder="Introduce yourself and outline what specific guidance you are seeking..."
                />
              </div>

              {modalFeedback && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.88rem",
                    background: modalFeedback.includes("success") ? "var(--color-success-bg)" : "var(--color-danger-bg)",
                    color: modalFeedback.includes("success") ? "var(--color-success)" : "var(--color-danger)",
                  }}
                >
                  {modalFeedback}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalMentor(null)}
                  disabled={submittingRequest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingRequest}
                >
                  {submittingRequest ? "Sending Request..." : "Send Mentorship Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

