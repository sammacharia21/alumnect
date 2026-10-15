import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #0b192c 0%, #1e3e62 100%)",
          color: "white",
          borderRadius: "var(--radius-lg)",
          padding: "3.5rem 2.5rem",
          marginBottom: "2.5rem",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, maxWidth: "720px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(2, 132, 199, 0.25)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              color: "#38bdf8",
              fontSize: "0.82rem",
              fontWeight: 700,
              padding: "0.3rem 0.8rem",
              borderRadius: "9999px",
              marginBottom: "1.25rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span>✈️ Sentence-BERT + pgvector (384-D)</span>
          </div>

          <h1
            style={{
              fontSize: "2.75rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
            }}
          >
            Aviation Mentorship Powered by Semantic AI
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: "#cbd5e1",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            Alumnect bridges aviation students and junior first officers with senior airline captains,
            licensed aircraft maintenance engineers, and dispatch operations specialists using dense vector
            embeddings and human-in-the-loop review.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <Link
              href="/register"
              className="btn btn-primary"
              style={{
                fontSize: "1.05rem",
                padding: "0.75rem 1.75rem",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.4)",
              }}
            >
              🚀 Get Started / Register
            </Link>
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{
                fontSize: "1.05rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.12)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
            >
              🔑 Sign In
            </Link>
            <Link
              href="/recommendations"
              className="btn btn-secondary"
              style={{
                fontSize: "1.05rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              ⚡ Explore Vector Search
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-navy)", marginBottom: "1.25rem" }}>
          Engine Specifications & Validated Metrics
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          <div className="card">
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🎯</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-navy)" }}>
              0.45 Operational Threshold
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              Tuned and validated on ground-truth benchmark pairs, achieving an F1-score of 0.88 with 91.7% Recall and 84.6% Precision.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🧠</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-navy)" }}>
              Aviation Domain SBERT
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              Powered by <code style={{ color: "var(--color-primary)", fontWeight: 600 }}>all-MiniLM-L6-v2</code> with protected token preprocessors for ICAO, FAA, B787, ATPL, and ETOPS acronyms.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>⚡</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-navy)" }}>
              PostgreSQL + pgvector
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              498 dense mentor embeddings indexed in PostgreSQL container with real-time cosine distance operator (<code style={{ color: "var(--color-primary)", fontWeight: 600 }}>&lt;=&gt;</code>).
            </p>
          </div>
        </div>
      </section>

      {/* Domains Covered */}
      <section className="card" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "1rem" }}>
          Aviation Mentorship Disciplines
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
            <h4 style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.25rem" }}>
              Flight Operations
            </h4>
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
              Fleet Captains, Type Rating Instructors (TRI), Line Check Airmen, Second Officers (B787, B737, E190).
            </p>
          </div>

          <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
            <h4 style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.25rem" }}>
              Technical & Maintenance
            </h4>
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
              Licensed Aircraft Maintenance Engineers (LAME), Avionics TCAS specialists, Quality Assurance (EASA B1/B2, KCAA).
            </p>
          </div>

          <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
            <h4 style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.25rem" }}>
              Corporate & Airline Ops
            </h4>
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
              Flight Dispatchers, Crew Schedulers, Network Planners, Airline Safety Management Systems (SMS) Officers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
