"use client";

import React, { useState, useEffect } from "react";

export default function MentorProfilePage() {
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("Flight Operations");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState(15);
  const [certifications, setCertifications] = useState("");
  const [rawBio, setRawBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUserId(data.data.id);
          const p = data.data.profile;
          if (p) {
            setFullName(p.fullName || "");
            setDepartment(p.department || "Flight Operations");
            setJobTitle(p.jobTitle || "");
            setYearsExperience(p.yearsExperience || 15);
            setCertifications(p.certifications || "");
            setRawBio(p.rawBio || "");
          }
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fullName,
          department,
          jobTitle,
          yearsExperience,
          certifications,
          rawBio,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback("Mentor credentials and profile updated successfully!");
      } else {
        setFeedback(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setFeedback("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">Mentor Credentials & Availability</h1>
        <p className="page-subtitle">
          Updating your narrative bio keeps your aviation experience up-to-date so matching recommendations remain accurate.
        </p>
      </div>

      <div className="card">
        {feedback && (
          <div
            style={{
              padding: "0.85rem",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1.25rem",
              fontSize: "0.9rem",
              background: feedback.includes("successfully") ? "var(--color-success-bg)" : "var(--color-danger-bg)",
              color: feedback.includes("successfully") ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {feedback}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Full Display Name & Rank
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Capt. Layla Otieno"
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
                Aviation Department
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
                <option value="Air Traffic Control & Dispatch">Air Traffic Control & Dispatch</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                Designated Title / Role
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Line Check Airman, Fleet Captain"
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
                min={1}
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
                Certifications, Ratings & Approvals
              </label>
              <input
                type="text"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="e.g. ATPL, B787 Type Rating, CAT III Approval, MCC"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Mentor Experience & Guidance Narrative (SBERT Vector Source)
            </label>
            <textarea
              rows={5}
              required
              value={rawBio}
              onChange={(e) => setRawBio(e.target.value)}
              placeholder="Detail your fleet command history, flight hours, instructional background, and the specific guidance you offer..."
              style={{
                width: "100%",
                padding: "0.75rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                lineHeight: 1.5,
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ width: "100%", padding: "0.75rem" }}
          >
            {saving ? "Saving Changes..." : "💾 Update Mentor Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

