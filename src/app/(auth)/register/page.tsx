"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"MENTEE" | "MENTOR">("MENTEE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      router.push(data.data.redirectTo || "/onboarding");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Registration error");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "460px", margin: "2.5rem auto" }}>
      <div className="card" style={{ padding: "2.25rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--color-navy)" }}>
            Join Alumnect
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Select your aviation pathway and create your account
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "0.75rem",
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1.25rem",
              fontSize: "0.88rem",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <button
              type="button"
              onClick={() => setRole("MENTEE")}
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: role === "MENTEE" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                background: role === "MENTEE" ? "var(--color-primary-light)" : "white",
                color: role === "MENTEE" ? "var(--color-primary)" : "var(--color-text)",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              🎓 I am a Mentee
            </button>
            <button
              type="button"
              onClick={() => setRole("MENTOR")}
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: role === "MENTOR" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                background: role === "MENTOR" ? "var(--color-primary-light)" : "white",
                color: role === "MENTOR" ? "var(--color-primary)" : "var(--color-text)",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              ✈️ I am a Mentor
            </button>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. pilot@alumnect.dev"
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 6 characters"
              minLength={6}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem" }}
          >
            {loading ? "Creating Account..." : "Create Account & Continue to Onboarding →"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
