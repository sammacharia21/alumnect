"use client";

import React, { useState } from "react";

interface GoogleSignInButtonProps {
  role?: "MENTEE" | "MENTOR";
  text?: string;
}

export default function GoogleSignInButton({
  role = "MENTEE",
  text = "Continue with Google",
}: GoogleSignInButtonProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleGoogleClick = async () => {
    // Check if Google Client ID is configured in the environment
    try {
      const res = await fetch(`/api/auth/google?role=${role}`, { method: "HEAD" });
      if (res.status === 400) {
        // Not configured in .env yet, open guidance & instant demo modal
        setShowConfigModal(true);
        return;
      }
      // If configured or redirects, proceed directly
      window.location.href = `/api/auth/google?role=${role}`;
    } catch {
      window.location.href = `/api/auth/google?role=${role}`;
    }
  };

  const handleDemoSignIn = (email = "pilot.samuel@gmail.com") => {
    window.location.href = `/api/auth/google?demo=true&email=${encodeURIComponent(email)}&role=${role}`;
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "0.65rem 1rem",
          background: "#ffffff",
          color: "#374151",
          border: "1px solid #d1d5db",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f9fafb";
          e.currentTarget.style.borderColor = "#9ca3af";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#ffffff";
          e.currentTarget.style.borderColor = "#d1d5db";
        }}
      >
        {/* Official Google G SVG */}
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{text}</span>
      </button>

      {/* Google Setup Guidance & Demo Modal */}
      {showConfigModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowConfigModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "0.75rem",
              maxWidth: "500px",
              width: "100%",
              padding: "2rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-navy)" }}>
                  Google OAuth Configuration
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                  Connect your Google Cloud project or test with a simulated account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                style={{ fontSize: "1.25rem", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.82rem", lineHeight: 1.6, color: "#334155", marginBottom: "1.25rem" }}>
              <strong>To enable real Google sign-in:</strong>
              <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0 0" }}>
                <li>Create credentials in Google Cloud Console (OAuth 2.0 Client ID).</li>
                <li>Set Authorized redirect URI to: <code style={{ color: "var(--color-primary)" }}>http://localhost:3000/api/auth/google/callback</code></li>
                <li>Add <code style={{ color: "var(--color-primary)" }}>GOOGLE_CLIENT_ID</code> and <code style={{ color: "var(--color-primary)" }}>GOOGLE_CLIENT_SECRET</code> to your <code style={{ color: "var(--color-primary)" }}>.env</code> file.</li>
              </ol>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Instant Test Option:
              </span>
              <button
                type="button"
                onClick={() => handleDemoSignIn("samuel.alumni@gmail.com")}
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.75rem", fontSize: "0.92rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <span>Continue as demo user: samuel.alumni@gmail.com</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

