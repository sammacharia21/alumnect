import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #0b192c 0%, #172554 60%, #450a0a 100%)",
          color: "white",
          borderRadius: "var(--radius-lg)",
          padding: "3.75rem 2.75rem",
          marginBottom: "3rem",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Ambient Red Glow Accent */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "280px",
            height: "280px",
            background: "radial-gradient(circle, rgba(200, 16, 46, 0.3) 0%, rgba(200, 16, 46, 0) 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "760px" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(200, 16, 46, 0.2)",
              border: "1px solid rgba(254, 202, 202, 0.35)",
              color: "#fca5a5",
              fontSize: "0.82rem",
              fontWeight: 700,
              padding: "0.3rem 0.85rem",
              borderRadius: "9999px",
              marginBottom: "1.25rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-kq-red)" }} />
            <span>Kenya Airways Alumni Network</span>
          </div>

          <h1
            style={{
              fontSize: "2.85rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
            }}
          >
            Aviation Mentorship & Knowledge Transfer Platform
          </h1>

          <p
            style={{
              fontSize: "1.12rem",
              color: "#cbd5e1",
              lineHeight: 1.65,
              marginBottom: "2.25rem",
              maxWidth: "680px",
            }}
          >
            Connecting aviation students, cadet pilots, and apprentice engineers with seasoned Kenya Airways captains, licensed aircraft maintenance engineers, and operational specialists.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {user ? (
              <>
                <Link
                  href={user.role === "ADMIN" ? "/admin/dashboard" : user.role === "MENTOR" ? "/dashboard/mentor" : "/dashboard/mentee"}
                  className="btn btn-primary"
                  style={{
                    fontSize: "0.98rem",
                    padding: "0.75rem 1.75rem",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  Go to My Dashboard →
                </Link>
                <Link
                  href="/recommendations"
                  className="btn btn-secondary"
                  style={{
                    fontSize: "0.98rem",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  Explore Mentors
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn btn-primary"
                  style={{
                    fontSize: "0.98rem",
                    padding: "0.75rem 1.75rem",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="btn btn-secondary"
                  style={{
                    fontSize: "0.98rem",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/recommendations"
                  className="btn btn-secondary"
                  style={{
                    fontSize: "0.98rem",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "var(--radius-md)",
                    background: "transparent",
                    color: "#cbd5e1",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  Explore Mentors
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Operational Disciplines Section */}
      <section style={{ marginBottom: "3rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-navy)", letterSpacing: "-0.02em" }}>
            Aviation Disciplines Covered
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Explore mentorship opportunities across the three foundational divisions of commercial airline operations.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {/* Flight Operations */}
          <div className="card" style={{ borderTop: "3px solid var(--color-kq-red)" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>✈️</div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.4rem" }}>
              Flight Operations
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "0.85rem" }}>
              Fleet Captains, Type Rating Instructors (TRI), Line Check Airmen, and First Officers supporting long-haul and regional routes.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              <span className="badge badge-dept" style={{ fontSize: "0.72rem" }}>Boeing B787 Dreamliner</span>
              <span className="badge badge-dept" style={{ fontSize: "0.72rem" }}>Boeing B737-800</span>
              <span className="badge badge-dept" style={{ fontSize: "0.72rem" }}>Embraer E190</span>
            </div>
          </div>

          {/* Technical & Maintenance Engineering */}
          <div className="card" style={{ borderTop: "3px solid var(--color-navy)" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>🔧</div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.4rem" }}>
              Technical & Maintenance Engineering
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "0.85rem" }}>
              Licensed Aircraft Maintenance Engineers (LAME) and avionics technicians specializing in heavy maintenance, line checks, and systems reliability.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              <span className="badge badge-dept" style={{ fontSize: "0.72rem" }}>ICAO Type II / KCAA</span>
              <span className="badge badge-dept" style={{ fontSize: "0.72rem" }}>Avionics & TCAS</span>
              <span className="badge badge-dept" style={{ fontSize: "0.72rem" }}>CFM56 & GEnx Powerplants</span>
            </div>
          </div>

          {/* Corporate & Airline Operations */}
          <div className="card" style={{ borderTop: "3px solid #0284c7" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>📡</div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.4rem" }}>
              Corporate & Airline Operations
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "0.85rem" }}>
              Licensed flight dispatchers, ground operations leaders, network planning analysts, and Safety Management Systems (SMS) coordinators.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              <span className="badge badge-dept" style={{ fontSize: "0.72rem" }}>Flight Dispatch</span>
              <span className="badge badge-dept" style={{ fontSize: "0.72rem" }}>Safety Management (SMS)</span>
              <span className="badge badge-dept" style={{ fontSize: "0.72rem" }}>Ground Handling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities (3 clean, practical highlights) */}
      <section style={{ marginBottom: "3rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-navy)", letterSpacing: "-0.02em" }}>
            What Alumnect Offers
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Purpose-built tools designed to support meaningful, career-accelerating professional relationships.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          <div className="card">
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.4rem" }}>
              🎯 Targeted Career Matching
            </h4>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Describe your career goals or training aspirations in your own words. The platform identifies mentors with relevant fleet ratings and certifications.
            </p>
          </div>

          <div className="card">
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.4rem" }}>
              🛡️ Verified Alumni Network
            </h4>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Engage with verified Kenya Airways alumni and experienced active personnel across an organized, spam-free corporate platform.
            </p>
          </div>

          <div className="card">
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.4rem" }}>
              📅 Direct Advisory Sessions
            </h4>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Approved pairings unlock direct corporate email channels, video meeting scheduling (Google Meet, Teams, Zoom), and a shared timeline for guidance notes.
            </p>
          </div>
        </div>
      </section>

      {/* Simple Call to Action Card */}
      <section
        className="card"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #fef2f2 100%)",
          border: "1px solid var(--color-kq-red-border)",
          padding: "2.5rem 2rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-navy)" }}>
            Ready to Accelerate Your Aviation Career?
          </h3>
          <p style={{ fontSize: "0.92rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Join the Kenya Airways alumni mentorship network or explore active mentors today.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/recommendations" className="btn btn-secondary">
            Explore Mentors
          </Link>
          <Link href="/register" className="btn btn-primary">
            Join Platform
          </Link>
        </div>
      </section>
    </div>
  );
}
