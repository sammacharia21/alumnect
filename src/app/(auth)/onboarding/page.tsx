"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userRole, setUserRole] = useState<string>("MENTEE");

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("Flight Operations");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState(2);
  const [certifications, setCertifications] = useState("");
  const [rawBio, setRawBio] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUserRole(data.data.role);
          if (data.data.profile) {
            // Already has profile, redirect to dashboard
            const redirect = data.data.role === "ADMIN"
              ? "/admin/dashboard"
              : data.data.role === "MENTOR"
              ? "/dashboard/mentor"
              : "/dashboard/mentee";
            router.push(redirect);
          }
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        throw new Error(data.error || "Failed to complete onboarding.");
      }

      router.push(data.data.redirectTo || (userRole === "MENTOR" ? "/dashboard/mentor" : "/dashboard/mentee"));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "2rem auto" }}>
      <div className="card" style={{ padding: "2.5rem" }}>
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
              marginBottom: "0.75rem",
              textTransform: "uppercase",
            }}
          >
            Profile Setup
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-navy)" }}>
            Complete Your Aviation Profile
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", marginTop: "0.35rem", lineHeight: 1.5 }}>
            Provide your professional background, ratings, and career goals to enable intelligent mentorship matching across the Kenya Airways alumni network.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "0.85rem",
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Full Display Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Capt. Sarah Jenkins or Brian Mutua"
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
                Aviation Department *
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
                Job Title / Rank / Level *
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. First Officer B737, Student Aviator, LAME"
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
                Years Experience *
              </label>
              <input
                type="number"
                min={0}
                max={50}
                required
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
                placeholder="e.g. CPL, ATPL, ICAO Level 6, B737 Type Rating, EASA B1.1"
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
              Aviation Background & Mentorship Objectives *
            </label>
            <textarea
              rows={5}
              required
              minLength={40}
              value={rawBio}
              onChange={(e) => setRawBio(e.target.value)}
              placeholder="Describe your flight hours, aircraft types flown or maintained, career roadmap, and specific guidance you are seeking or offering..."
              style={{
                width: "100%",
                padding: "0.75rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                lineHeight: 1.5,
              }}
            />
            <span style={{ fontSize: "0.78rem", color: "var(--color-text-light)", display: "block", marginTop: "0.35rem" }}>
              Detail your fleet experience, licenses (e.g. CPL, ATPL, EASA), or operational goals for accurate compatibility matching (minimum 40 characters).
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
          >
            {loading ? "Saving Profile & Analyzing Matches..." : "Complete Profile & Enter Platform"}
          </button>
        </form>
      </div>
    </div>
  );
}

