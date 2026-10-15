"use client";

import React, { useState, useEffect } from "react";
import type { MentorMatch } from "@/types";

const SUGGESTED_QUERIES = [
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

export default function MenteeExplorePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [queryText, setQueryText] = useState(SUGGESTED_QUERIES[0]);
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [minExperience, setMinExperience] = useState(0);
  const [threshold, setThreshold] = useState(0.45);
  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Request modal state
  const [modalMentor, setModalMentor] = useState<MentorMatch | null>(null);
  const [requestNotes, setRequestNotes] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [pendingMentorIds, setPendingMentorIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCurrentUser(data.data);
          // Load mentee's existing sent requests to show "Request Pending" on cards
          fetch(`/api/requests?userId=${data.data.id}&role=mentee`)
            .then((r) => r.json())
            .then((reqData) => {
              if (reqData.success && Array.isArray(reqData.data)) {
                const ids = new Set<string>(reqData.data.map((r: any) => r.mentorId));
                setPendingMentorIds(ids);
              }
            });

          // Run initial search using mentee's stored bio or default query
          const initialBio = data.data.profile?.rawBio || SUGGESTED_QUERIES[0];
          setQueryText(initialBio);
          runSemanticSearch(initialBio);
        } else {
          runSemanticSearch(SUGGESTED_QUERIES[0]);
        }
      })
      .catch(() => runSemanticSearch(SUGGESTED_QUERIES[0]));
  }, []);

  const runSemanticSearch = async (textToSearch?: string) => {
    const query = (textToSearch ?? queryText).trim();
    if (!query) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/matches/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: query,
          threshold,
          limit,
          department: selectedDept === "ALL" ? undefined : selectedDept,
          excludeUserId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        let results = data.data;
        if (minExperience > 0) {
          results = results.filter((m: MentorMatch) => m.yearsExperience >= minExperience);
        }
        setMatches(results);
      } else {
        setErrorMessage(data.error || "No matching mentors found.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Search error.");
    } finally {
      setLoading(false);
    }
  };

  const submitMentorshipRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMentor || !currentUser?.id) return;

    setSubmittingRequest(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menteeId: currentUser.id,
          mentorId: modalMentor.userId,
          similarityScore: modalMentor.similarity,
          notes: requestNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequestSuccess(true);
        setPendingMentorIds((prev) => new Set([...prev, modalMentor.userId]));
        setTimeout(() => {
          setModalMentor(null);
          setRequestSuccess(false);
          setRequestNotes("");
        }, 1200);
      } else {
        alert(data.error || "Failed to submit request.");
      }
    } catch (err) {
      alert("Submission error");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">Semantic Mentor Discovery</h1>
        <p className="page-subtitle">
          AI matching calculates cosine similarity between your aviation goals and certified airline mentors.
        </p>
      </div>

      {/* Query & Filter Panel */}
      <div className="card" style={{ marginBottom: "1.75rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.4rem" }}>
            Search Query or Describe Your Learning Goals
          </label>
          <textarea
            rows={3}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              lineHeight: 1.5,
            }}
            placeholder="e.g. Seeking mentorship from wide-body captains on B787 line training and ETOPS operations..."
          />
        </div>

        {/* Suggested Queries */}
        <div style={{ marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-light)", marginRight: "0.5rem" }}>
            QUICK PROMPTS:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQueryText(q);
                  runSemanticSearch(q);
                }}
                style={{
                  background: queryText === q ? "var(--color-primary-light)" : "#f1f5f9",
                  color: queryText === q ? "var(--color-primary)" : "var(--color-text)",
                  border: queryText === q ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                {q.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-light)", marginBottom: "0.25rem" }}>
              DEPARTMENT
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: "0.45rem 0.75rem",
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

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-light)", marginBottom: "0.25rem" }}>
              MIN EXPERIENCE
            </label>
            <select
              value={minExperience}
              onChange={(e) => setMinExperience(parseInt(e.target.value, 10))}
              style={{
                padding: "0.45rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                background: "white",
              }}
            >
              <option value={0}>Any Experience</option>
              <option value={10}>10+ Years</option>
              <option value={15}>15+ Years</option>
              <option value={20}>20+ Years</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "180px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              <span>THRESHOLD:</span>
              <span style={{ color: "var(--color-primary)" }}>{threshold.toFixed(2)} (Baseline: 0.45)</span>
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

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => runSemanticSearch()}
            disabled={loading}
            style={{ marginLeft: "auto", minWidth: "140px" }}
          >
            {loading ? "Matching..." : "⚡ Search Mentors"}
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)" }}>
          Recommended Aviation Mentors
        </h3>
        <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          Found {matches.length} mentors (Similarity ≥ {threshold.toFixed(2)})
        </span>
      </div>

      {errorMessage && (
        <div style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
          {errorMessage}
        </div>
      )}

      {/* Mentor Cards Grid */}
      <div className="grid-2">
        {matches.map((mentor) => {
          const isPending = pendingMentorIds.has(mentor.userId);
          const certList = mentor.certifications
            ? mentor.certifications.split(",").map((c) => c.trim()).filter(Boolean)
            : [];

          const isHigh = mentor.compatibilityPercentage >= 70;
          const isGood = mentor.compatibilityPercentage >= 55;
          const scoreClass = isHigh ? "score-high" : isGood ? "score-good" : "score-fair";

          return (
            <article key={mentor.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)" }}>
                    {mentor.fullName}
                  </h4>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary)", marginTop: "0.1rem" }}>
                    {mentor.jobTitle}
                  </div>
                </div>

                <div className={`score-pill ${scoreClass}`}>
                  <span>★</span>
                  <span>{mentor.compatibilityPercentage}% Match</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.85rem" }}>
                <span className="badge badge-dept">{mentor.department}</span>
                <span className="badge" style={{ background: "#f8fafc", border: "1px solid var(--color-border)", color: "#334155" }}>
                  ⏱ {mentor.yearsExperience} yrs exp
                </span>
              </div>

              <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "1rem", flexGrow: 1 }}>
                {mentor.rawBio}
              </p>

              {certList.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.25rem" }}>
                  {certList.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#f1f5f9",
                        color: "#0f172a",
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: 500,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                className={`btn ${isPending ? "btn-secondary" : "btn-primary"}`}
                disabled={isPending}
                onClick={() => {
                  setModalMentor(mentor);
                  setRequestNotes(`Hi ${mentor.fullName}, I would love your mentorship regarding ${mentor.jobTitle.toLowerCase()} pathways.`);
                  setRequestSuccess(false);
                }}
              >
                {isPending ? "⏳ Request Pending" : "🤝 Request Mentorship"}
              </button>
            </article>
          );
        })}
      </div>

      {/* Mentorship Request Modal */}
      {modalMentor && (
        <div className="modal-backdrop" onClick={() => setModalMentor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-navy)" }}>
                  Connect with {modalMentor.fullName}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
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
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Personalized Introduction / Mentorship Goal:
                </label>
                <textarea
                  rows={4}
                  required
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Introduce yourself and specify the exact guidance you are seeking..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {requestSuccess && (
                <div style={{ padding: "0.75rem", background: "var(--color-success-bg)", color: "var(--color-success)", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                  ✓ Mentorship request submitted successfully!
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
                  disabled={submittingRequest || requestSuccess}
                >
                  {submittingRequest ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

