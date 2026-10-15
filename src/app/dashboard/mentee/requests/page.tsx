"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { MentorshipRequestRecord } from "@/types";

export default function MenteeRequestsPage() {
  const [requests, setRequests] = useState<MentorshipRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      const userId = meData?.data?.id || "4ce8f4d9-b75b-4927-bc17-737f62e4e780";

      const res = await fetch(`/api/requests?userId=${userId}&role=mentee`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error("Error loading requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (requestId: string) => {
    if (!confirm("Are you sure you want to withdraw this mentorship request?")) return;
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: "REJECTED", notes: "Withdrawn by mentee" }),
      });
      const data = await res.json();
      if (data.success) {
        loadRequests();
      }
    } catch (err) {
      console.error("Error withdrawing request:", err);
    }
  };

  const pendingList = requests.filter((r) => r.status === "PENDING");
  const approvedList = requests.filter((r) => r.status === "APPROVED");
  const rejectedList = requests.filter((r) => r.status === "REJECTED");

  const currentList =
    activeTab === "PENDING"
      ? pendingList
      : activeTab === "APPROVED"
      ? approvedList
      : rejectedList;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">My Mentorship Requests</h1>
        <p className="page-subtitle">
          Track the status of your inquiries, active mentorship connections, and shared feedback.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "PENDING" ? "active" : ""}`}
          onClick={() => setActiveTab("PENDING")}
        >
          ⏳ Pending Inquiries ({pendingList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "APPROVED" ? "active" : ""}`}
          onClick={() => setActiveTab("APPROVED")}
        >
          🤝 Active Mentorships ({approvedList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "REJECTED" ? "active" : ""}`}
          onClick={() => setActiveTab("REJECTED")}
        >
          📁 Past / Declined ({rejectedList.length})
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Loading your mentorship requests...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            No requests currently in the {activeTab.toLowerCase()} list.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <Link href="/dashboard/mentee" className="btn btn-primary">
              🔍 Discover Aviation Mentors
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {currentList.map((req) => {
            const matchScore = Math.round(req.similarityScore * 100);
            return (
              <div key={req.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)" }}>
                      {req.mentor?.profile?.fullName || "Aviation Mentor"}
                    </h3>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-primary)" }}>
                      {req.mentor?.profile?.jobTitle} • {req.mentor?.profile?.department}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="score-pill score-high">★ {matchScore}% Match</span>
                    <span
                      className={`badge ${
                        req.status === "APPROVED"
                          ? "badge-approved"
                          : req.status === "REJECTED"
                          ? "badge-rejected"
                          : "badge-pending"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Introduction / Notes */}
                {req.notes && (
                  <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--color-primary)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", display: "block", marginBottom: "0.2rem" }}>
                      YOUR INTRODUCTION MESSAGE:
                    </span>
                    <p style={{ fontSize: "0.88rem", color: "var(--color-text)" }}>"{req.notes}"</p>
                  </div>
                )}

                {/* Approved state: Mentor contact info */}
                {req.status === "APPROVED" && (
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#065f46" }}>
                        MENTOR CONTACT DETAILS:
                      </div>
                      <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#047857" }}>
                        📧 {req.mentor?.email}
                      </div>
                    </div>
                    <a
                      href={`mailto:${req.mentor?.email}?subject=Alumnect Mentorship Follow-up`}
                      className="btn btn-success"
                      style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem" }}
                    >
                      ✉️ Send Email
                    </a>
                  </div>
                )}

                {/* Pending state: Withdraw action */}
                {req.status === "PENDING" && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: "0.82rem", color: "var(--color-danger)" }}
                      onClick={() => handleWithdraw(req.id)}
                    >
                      Withdraw Request
                    </button>
                  </div>
                )}

                <div style={{ fontSize: "0.78rem", color: "var(--color-text-light)", textAlign: "right" }}>
                  Submitted on {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

