"use client";

import React, { useState } from "react";
import type { MentorshipRequestRecord, SessionLogItem } from "@/types";

interface ApprovedMentorshipCardProps {
  request: MentorshipRequestRecord;
  currentRole: "MENTEE" | "MENTOR" | "ADMIN";
  onUpdated?: () => void;
}

export default function ApprovedMentorshipCard({
  request,
  currentRole,
  onUpdated,
}: ApprovedMentorshipCardProps) {
  const matchScore = Math.round(request.similarityScore * 100);
  const sessionData = request.sessionData || { intro: request.notes || "", logs: [] };

  const otherPerson =
    currentRole === "MENTEE"
      ? {
          name: request.mentor?.profile?.fullName || "Aviation Mentor",
          title: request.mentor?.profile?.jobTitle || "Fleet Specialist",
          department: request.mentor?.profile?.department || "Flight Operations",
          email: request.mentor?.email || "mentor@alumnect.dev",
          roleLabel: "Mentor",
        }
      : {
          name: request.mentee?.profile?.fullName || "Mentee Candidate",
          title: request.mentee?.profile?.jobTitle || "Student Pilot / First Officer",
          department: request.mentee?.profile?.department || "Aviation Student",
          email: request.mentee?.email || "mentee@alumnect.dev",
          roleLabel: "Mentee",
        };

  // Scheduling state
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [meetingLink, setMeetingLink] = useState(sessionData.meetingLink || "");
  const [scheduledAt, setScheduledAt] = useState(sessionData.scheduledAt || "");
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Notes state
  const [newNoteText, setNewNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [logs, setLogs] = useState<SessionLogItem[]>(sessionData.logs || []);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          meetingLink,
          scheduledAt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditingSchedule(false);
        if (onUpdated) onUpdated();
      } else {
        alert(data.error || "Failed to update schedule.");
      }
    } catch {
      alert("Error saving session schedule.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setSavingNote(true);
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          newLogNote: newNoteText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.sessionData?.logs) {
        setLogs(data.data.sessionData.logs);
        setNewNoteText("");
        if (onUpdated) onUpdated();
      }
    } catch {
      alert("Error adding discussion note.");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        border: "1px solid #10b981",
        boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        marginBottom: "1.25rem",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                background: "#ecfdf5",
                color: "#059669",
                fontSize: "0.72rem",
                fontWeight: 800,
                padding: "0.2rem 0.55rem",
                borderRadius: "9999px",
                textTransform: "uppercase",
              }}
            >
              🤝 ACTIVE MENTORSHIP CONNECTION
            </span>
          </div>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-navy)", marginTop: "0.35rem" }}>
            {otherPerson.name}
          </h3>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary)", marginTop: "0.1rem" }}>
            {otherPerson.title} • {otherPerson.department} ({otherPerson.roleLabel})
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span className="score-pill score-high">★ {matchScore}% Match</span>
          <span className="badge badge-approved">APPROVED</span>
        </div>
      </div>

      {/* Verified Contact Bar */}
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "var(--radius-sm)",
          padding: "0.85rem 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", display: "block" }}>
            Verified Kenya Airways Communication:
          </span>
          <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#15803d" }}>
            📧 {otherPerson.email}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <a
            href={`mailto:${otherPerson.email}?subject=Alumnect Mentorship Connection`}
            className="btn btn-success"
            style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem", textDecoration: "none" }}
          >
            ✉️ Email {otherPerson.roleLabel}
          </a>
        </div>
      </div>

      {/* Introduction Narrative Excerpt */}
      {sessionData.intro && (
        <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--color-primary)" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>
            Initial Inquiry / Goals:
          </span>
          <p style={{ fontSize: "0.88rem", color: "var(--color-text)", margin: 0, lineHeight: 1.5 }}>
            "{sessionData.intro}"
          </p>
        </div>
      )}

      {/* Video Call & Session Scheduling Section */}
      <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase", display: "block" }}>
              Advisory Session Scheduling:
            </span>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-navy)", marginTop: "0.15rem" }}>
              {scheduledAt ? (
                <>🗓️ {new Date(scheduledAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</>
              ) : (
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>No session scheduled yet</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
            onClick={() => setIsEditingSchedule(!isEditingSchedule)}
          >
            {isEditingSchedule ? "✕ Close" : scheduledAt || meetingLink ? "✏️ Reschedule" : "➕ Schedule Session"}
          </button>
        </div>

        {/* Action Button for Meeting Link */}
        {meetingLink && !isEditingSchedule && (
          <div style={{ marginTop: "0.5rem" }}>
            <a
              href={meetingLink.startsWith("http") ? meetingLink : `https://${meetingLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.55rem 1.25rem",
                fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(2, 132, 199, 0.2)",
              }}
            >
              <span>🎥 Join Advisory Video Call</span>
              <span style={{ fontSize: "0.78rem", opacity: 0.85 }}>({meetingLink.replace(/^https?:\/\//, "").slice(0, 25)}...)</span>
              <span>↗</span>
            </a>
          </div>
        )}

        {/* Inline Schedule Edit Form */}
        {isEditingSchedule && (
          <form onSubmit={handleSaveSchedule} style={{ marginTop: "1rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.85rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Session Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.88rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Video Call URL (Google Meet / Teams / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.88rem",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                onClick={() => setIsEditingSchedule(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingSchedule}
                style={{ fontSize: "0.82rem", padding: "0.4rem 0.95rem" }}
              >
                {savingSchedule ? "Saving..." : "Save Schedule & Meeting Link"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Collaborative Mentorship Action Items & Discussion Logs */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-navy)", textTransform: "uppercase" }}>
            Mentorship Log & Action Milestones ({logs.length})
          </span>
        </div>

        {/* Existing Logs Timeline */}
        {logs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
            {logs.map((log) => {
              const isMine =
                (currentRole === "MENTOR" && log.authorRole === "MENTOR") ||
                (currentRole === "MENTEE" && log.authorRole === "MENTEE");

              return (
                <div
                  key={log.id}
                  style={{
                    padding: "0.75rem 1rem",
                    background: isMine ? "#f8fafc" : "#ffffff",
                    border: "1px solid var(--color-border)",
                    borderLeft: log.authorRole === "MENTOR" ? "3px solid #8b5cf6" : "3px solid var(--color-primary)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-navy)" }}>
                      {log.authorName}{" "}
                      <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                        ({log.authorRole})
                      </span>
                    </span>
                    <span style={{ fontSize: "0.74rem", color: "var(--color-text-light)" }}>
                      {new Date(log.createdAt).toLocaleDateString()} at{" "}
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--color-text)", margin: 0, lineHeight: 1.5 }}>
                    {log.text}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: "0.84rem", color: "var(--color-text-light)", fontStyle: "italic", marginBottom: "0.85rem" }}>
            No meeting notes or action items logged yet. Record discussion summaries or goals below.
          </p>
        )}

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            required
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder={`Log an action item, discussion summary, or reading goal (e.g. 'Completed B787 FMC review')...`}
            style={{
              flex: 1,
              padding: "0.6rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              fontSize: "0.88rem",
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={savingNote || !newNoteText.trim()}
            style={{ padding: "0.6rem 1.1rem", fontSize: "0.88rem", whiteSpace: "nowrap" }}
          >
            {savingNote ? "Saving..." : "➕ Post Note"}
          </button>
        </form>
      </div>
    </div>
  );
}

