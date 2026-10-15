import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alumnect | AI-Driven Aviation Mentorship Platform",
  description: "Connect aviation students, first officers, and engineers with veteran captains, instructors, and specialists using SBERT semantic matching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="header-container">
            <Link href="/" className="brand">
              <span>✈️ Alumnect</span>
              <span className="brand-badge">SBERT pgvector</span>
            </Link>

            <nav className="nav-links">
              <Link href="/recommendations" className="nav-item">
                Explore Mentors
              </Link>
              <Link href="/login" className="nav-item" style={{ fontWeight: 600 }}>
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem", textDecoration: "none" }}
              >
                Join Platform
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#10b981", fontWeight: 600, background: "#ecfdf5", padding: "0.3rem 0.65rem", borderRadius: "9999px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                498 Vectors Live
              </div>
            </nav>
          </div>
        </header>

        <main className="main-layout">{children}</main>
      </body>
    </html>
  );
}
