"use client";

import React, { useState, useEffect } from "react";

export default function ProfilePage() {
  const [userId, setUserId] = useState("4ce8f4d9-b75b-4927-bc17-737f62e4e780"); // Demo Mentee
  const [fullName, setFullName] = useState("User_mentee_Fli_2");
  const [department, setDepartment] = useState("Flight Operations");
  const [jobTitle, setJobTitle] = useState("Second Officer");
  const [yearsExperience, setYearsExperience] = useState(4);
  const [certifications, setCertifications] = useState("MCC, ICAO Level 6");
  const [rawBio, setRawBio] = useState(
    "Commercial First Officer on regional jet equipment preparing for narrow-body B737 line conversion. Seeking guidance on standard instrument departures, simulator checks, and command upgrade pathways."
  );

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage("");

    try {
      // 1. Save Profile
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fullName,
          department,
          jobTitle,
          yearsExperience: Number(yearsExperience),
          certifications,
          rawBio,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save profile");
      }

      // 2. Re-generate embedding
      const embedRes = await fetch("/api/embeddings/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: data.data.id,
          text: rawBio,
        }),
      });

      const embedData = await embedRes.json();
      if (embedData.success) {
        setStatusMessage("Profile updated and 384-dimensional vector embedding re-computed successfully!");
      } else {
        setStatusMessage("Profile updated (vector embedding sync pending).");
      }
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div className="page-header">
        <h1 className="page-title">Aviation Profile & Preferences</h1>
        <p className="page-subtitle">
          Your profile bio is vectorized via Sentence-BERT to compute semantic compatibility matches.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  background: "white",
                }}
              >
                <option value="Flight Operations">Flight Operations</option>
                <option value="Technical and Maintenance Engineering">Technical and Maintenance Engineering</option>
                <option value="Corporate and Airline Operations">Corporate and Airline Operations</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                Job Title / Rank
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                Years Experience
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseInt(e.target.value, 10))}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                Certifications / Ratings (comma-separated)
              </label>
              <input
                type="text"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="e.g. ATPL, B787 Type Rating, MCC, EASA B1.1"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Aviation Bio & Mentorship Interests (SBERT Input)
            </label>
            <textarea
              rows={5}
              value={rawBio}
              onChange={(e) => setRawBio(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                lineHeight: 1.5,
              }}
            />
          </div>

          {statusMessage && (
            <div
              style={{
                padding: "0.85rem",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1.25rem",
                fontSize: "0.9rem",
                background: statusMessage.includes("success") ? "var(--color-success-bg)" : "var(--color-primary-light)",
                color: statusMessage.includes("success") ? "var(--color-success)" : "var(--color-primary)",
              }}
            >
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ width: "100%", padding: "0.75rem" }}
          >
            {saving ? "Saving & Vectorizing..." : "💾 Save Profile & Update Embedding"}
          </button>
        </form>
      </div>
    </div>
  );
}

