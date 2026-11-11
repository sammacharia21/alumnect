"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeSession, setActiveSession] = useState<any>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setActiveSession(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setActiveSession(null);
  };

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

        {activeSession && (
          <div
            style={{
              padding: "0.85rem",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1.25rem",
              fontSize: "0.85rem",
              color: "#1e40af",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>Currently signed in:</strong>
              <div style={{ fontSize: "0.8rem", color: "#3b82f6" }}>{activeSession.email} ({activeSession.role})</div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link
                href={activeSession.role === "ADMIN" ? "/admin/dashboard" : activeSession.role === "MENTOR" ? "/dashboard/mentor" : "/dashboard/mentee"}
                className="btn btn-primary"
                style={{ padding: "0.3rem 0.65rem", fontSize: "0.78rem" }}
              >
                Go to Dashboard →
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: "0.3rem 0.65rem", fontSize: "0.78rem" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

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
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.65rem 2.5rem 0.65rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "0.65rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "0.2rem",
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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

        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0 1.25rem", color: "var(--color-text-muted)", fontSize: "0.82rem" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
          <span style={{ padding: "0 0.75rem", textTransform: "uppercase", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em" }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <GoogleSignInButton text="Sign in with Google" />
        </div>

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
