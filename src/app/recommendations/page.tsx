"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function RecommendationsPage() {
  const router = useRouter();

  // Search parameters (starts empty so visitor enters their own query)
  const [queryText, setQueryText] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [threshold, setThreshold] = useState(0.45);
  const [limit, setLimit] = useState(8);

  // Search results & loading states
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // User session state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal for connect / sign-in prompt
  const [selectedMentor, setSelectedMentor] = useState<MentorMatch | null>(null);

  // Auto-redirect authenticated mentees to their personalized dashboard
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCurrentUser(data.data);
          if (data.data.role === "MENTEE") {
            router.push("/dashboard/mentee");
          } else if (data.data.role === "MENTOR") {
            router.push("/dashboard/mentor");
          }
        }
      })
      .catch(() => {});
  }, [router]);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedMentor(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = async (overrideText?: string) => {
    const textToSearch = (overrideText ?? queryText).trim();
    if (!textToSearch) {
      setErrorMessage("Please enter an aviation interest or click one of the suggested topics below.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setHasSearched(true);

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
        setErrorMessage(resData.error || "No matching aviation mentors met the cosine threshold.");
        setMatches([]);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error connecting to recommendation service.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuery = (q: string) => {
    setQueryText(q);
    handleSearch(q);
  };

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "inline-block",
            background: "var(--color-primary-light)",
            color: "var(--color-primary)",
            fontWeight: 700,
            fontSize: "0.8rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            marginBottom: "0.5rem",
            textTransform: "uppercase",
          }}
        >
          Vector Search Explorer
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-navy)", lineHeight: 1.2 }}>
          Aviation Mentorship Matching Engine
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", marginTop: "0.35rem" }}>
          Test real-time Sentence-BERT embeddings paired with PostgreSQL pgvector dense vector retrieval (384 dimensions).
        </p>
      </div>

      {/* Search & Control Card */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "2.5rem" }}>
        <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--color-navy)" }}>
          Aviation Background, Goals & Mentorship Inquiry:
        </label>
        <textarea
          rows={3}
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Describe your flight hours, ratings, fleet interests, or specific mentorship goals (e.g. 'Looking for a B737 First Officer or Line Check Airman to mentor me on airline conversion and simulator prep')..."
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            fontSize: "0.95rem",
            lineHeight: 1.5,
          }}
        />

        {/* Suggested Queries */}
        <div style={{ marginTop: "0.85rem", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
            Or try a sample aviation query:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuery(q)}
                style={{
                  background: queryText === q ? "var(--color-primary)" : "#f1f5f9",
                  color: queryText === q ? "#ffffff" : "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "9999px",
                  padding: "0.35rem 0.8rem",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                {q.length > 55 ? `${q.substring(0, 55)}...` : q}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", alignItems: "end", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Aviation Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                background: "white",
              }}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d === "ALL" ? "All Disciplines" : d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              <span>Similarity Threshold:</span>
              <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                {threshold.toFixed(2)} (Baseline: 0.45)
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

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Max Mentors
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                background: "white",
              }}
            >
              <option value={4}>Top 4 Mentors</option>
              <option value={8}>Top 8 Mentors</option>
              <option value={12}>Top 12 Mentors</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.65rem 1rem", fontSize: "0.95rem" }}
            >
              {loading ? "⚙️ Searching pgvector..." : "⚡ Run AI Match"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
            }}
          >
            {errorMessage}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-navy)" }}>
            Recommended Aviation Mentors
          </h2>
          {hasSearched && !loading && (
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Found <strong>{matches.length}</strong> mentors meeting threshold ≥ {threshold.toFixed(2)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✈️</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy)" }}>
              Computing Dense SBERT Vector Embeddings...
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              Evaluating cosine similarity across 498 indexed aviation mentors in PostgreSQL.
            </p>
          </div>
        ) : !hasSearched ? (
          <div className="card" style={{ textAlign: "center", padding: "3.5rem 2rem", background: "#f8fafc" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>🧭</div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)" }}>
              Ready for Discovery
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", maxWidth: "520px", margin: "0.35rem auto 1.25rem", lineHeight: 1.5 }}>
              Enter your flight background or career goals above, or click one of the suggested sample topics to discover matching airline captains, engineers, and specialists.
            </p>
            <button
              onClick={() => handleSelectQuery(SUGGESTED_QUERIES[0])}
              className="btn btn-primary"
              style={{ padding: "0.6rem 1.25rem", fontSize: "0.9rem" }}
            >
              Try Sample B787 Captain Query
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
              No mentors met the selected similarity threshold ({threshold.toFixed(2)}).
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginTop: "0.25rem" }}>
              Try lowering the threshold slider to 0.45 or broadening your query text.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {matches.map((mentor) => (
              <div
                key={mentor.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "1.5rem",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--color-navy)" }}>
                        {mentor.fullName}
                      </h3>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-primary)" }}>
                        {mentor.jobTitle}
                      </div>
                    </div>
                    <span className="score-pill score-high">
                      ★ {mentor.compatibilityPercentage}% Match
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.6rem 0" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: "#f1f5f9",
                        color: "var(--color-text-muted)",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "var(--radius-sm)",
                        textTransform: "uppercase",
                      }}
                    >
                      {mentor.department}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: "#ecfdf5",
                        color: "#065f46",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      ⏱ {mentor.yearsExperience} yrs exp
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "0.84rem",
                      color: "var(--color-text)",
                      lineHeight: 1.5,
                      marginBottom: "0.85rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {mentor.rawBio}
                  </p>

                  {mentor.certifications && (
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-light)", marginBottom: "1rem" }}>
                      <strong>Ratings:</strong> {mentor.certifications}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMentor(mentor)}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.6rem", fontSize: "0.88rem" }}
                >
                  Request Mentorship
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect / Auth Prompt Modal */}
      {selectedMentor && (
        <div className="modal-backdrop" onClick={() => setSelectedMentor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🤝</div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-navy)" }}>
                Connect with {selectedMentor.fullName}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-primary)", fontWeight: 600, marginTop: "0.2rem" }}>
                {selectedMentor.jobTitle} • {selectedMentor.compatibilityPercentage}% AI Match
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", marginBottom: "1.5rem", fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              To send a direct mentorship request, track approvals, and exchange verified flight contact information, you need an active Alumnect account.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <Link
                href="/login"
                className="btn btn-secondary"
                style={{ textAlign: "center", textDecoration: "none", padding: "0.7rem", fontWeight: 700 }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ textAlign: "center", textDecoration: "none", padding: "0.7rem", fontWeight: 700 }}
              >
                Join Platform
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMentor(null)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "var(--color-text-light)",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: "0.5rem",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
