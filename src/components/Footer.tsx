import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--color-navy)",
        color: "#cbd5e1",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        marginTop: "auto",
      }}
    >
      {/* Red accent line along footer top */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #c8102e 0%, #e11d48 50%, #0b192c 100%)",
          width: "100%",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "3rem 1.5rem 2rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "2.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Brand & Purpose */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
              <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
                Alumnect
              </span>
              <span
                style={{
                  background: "rgba(200, 16, 46, 0.2)",
                  color: "#fca5a5",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px",
                  border: "1px solid rgba(200, 16, 46, 0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Kenya Airways
              </span>
            </div>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "#94a3b8" }}>
              A corporate alumni mentorship and knowledge-transfer platform connecting emerging aviation talent with veteran airline captains, licensed maintenance engineers, and operational leaders.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.85rem" }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <Link href="/" style={{ fontSize: "0.88rem", color: "#cbd5e1", transition: "color 0.15s" }}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/recommendations" style={{ fontSize: "0.88rem", color: "#cbd5e1", transition: "color 0.15s" }}>
                  Explore Mentors
                </Link>
              </li>
              <li>
                <Link href="/login" style={{ fontSize: "0.88rem", color: "#cbd5e1", transition: "color 0.15s" }}>
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" style={{ fontSize: "0.88rem", color: "#cbd5e1", transition: "color 0.15s" }}>
                  Join as Mentee or Mentor
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Divisions */}
          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.85rem" }}>
              Aviation Divisions
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li style={{ fontSize: "0.88rem", color: "#94a3b8" }}>
                ✈️ Flight Operations (B787, B737, E190)
              </li>
              <li style={{ fontSize: "0.88rem", color: "#94a3b8" }}>
                🔧 Aircraft Maintenance & Avionics (LAME)
              </li>
              <li style={{ fontSize: "0.88rem", color: "#94a3b8" }}>
                📡 Flight Dispatch & Airline Operations
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Institutional Credit */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "1.75rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            fontSize: "0.8rem",
            color: "#64748b",
          }}
        >
          <div>
            © {currentYear} Alumnect. Kenya Airways Alumni Mentorship Network.
          </div>
          <div>
            Strathmore University — School of Computing & Engineering Sciences (IS Project II)
          </div>
        </div>
      </div>
    </footer>
  );
}

