"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent, overrideEmail?: string, overridePass?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const targetEmail = overrideEmail || email;
    const targetPassword = overridePass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.data.redirectTo || "/dashboard/mentee");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign in");
      setLoading(false);
    }
  };

  const demoLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
    handleLogin(null as any, roleEmail, "password123");
  };

  return (
    <div style={{ maxWidth: "440px", margin: "3rem auto" }}>
      <div className="card" style={{ padding: "2.25rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--color-navy)" }}>
            Welcome to Alumnect
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Sign in to access your role-based aviation dashboard
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

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@alumnect.dev"
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
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
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "1.25rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-light)", display: "block", marginBottom: "0.65rem", textTransform: "uppercase" }}>
            Quick Demo Shortcuts:
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.2rem" }}
              onClick={() => demoLogin("user.mentee.fli_2@alumnect.dev")}
            >
              🎓 Mentee
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.2rem" }}
              onClick={() => demoLogin("capt.layla.otieno@alumnect.dev")}
            >
              ✈️ Mentor
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.2rem" }}
              onClick={() => demoLogin("admin@alumnect.dev")}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
