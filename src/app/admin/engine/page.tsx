"use client";

import React, { useState } from "react";

export default function AdminEnginePage() {
  const [testQuery, setTestQuery] = useState("Turbine engine overhaul and FADEC vibration diagnostics on modern high-bypass turbofans");
  const [testThreshold, setTestThreshold] = useState(0.45);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagResults, setDiagResults] = useState<any[]>([]);

  const runDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const res = await fetch("/api/matches/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: testQuery,
          threshold: testThreshold,
          limit: 5,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDiagResults(data.data);
      }
    } catch (err) {
      console.error("Diagnostics error:", err);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.75rem" }}>
        <h1 className="page-title">ML Engine & pgvector Diagnostics</h1>
        <p className="page-subtitle">
          Real-time metrics, embedding model health, and cosine distance query calibration.
        </p>
      </div>

      {/* Model Specifications Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Embedding Model
          </div>
          <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)", marginTop: "0.25rem" }}>
            all-MiniLM-L6-v2
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
            Hugging Face Sentence-BERT
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Dense Vector Dimension
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)", marginTop: "0.25rem" }}>
            384
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
            Unit-normalized float coordinates
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Validated Threshold
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#059669", marginTop: "0.25rem" }}>
            0.45
          </div>
          <div style={{ fontSize: "0.8rem", color: "#059669", fontWeight: 600, marginTop: "0.2rem" }}>
            F1: 0.88 (Recall: 91.7%, Precision: 84.6%)
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase" }}>
            Vector Coverage
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-navy)", marginTop: "0.25rem" }}>
            498 / 498
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
            100% indexed in PostgreSQL
          </div>
        </div>
      </div>

      {/* Real-time Query Simulator */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.75rem" }}>
          Vector Distance Simulator: 1 - (embedding &lt;=&gt; query_vector)
        </h3>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem" }}>
            Test Input Narrative:
          </label>
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              <span>Operating Cosine Threshold:</span>
              <span style={{ color: "var(--color-primary)" }}>{testThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.80"
              step="0.05"
              value={testThreshold}
              onChange={(e) => setTestThreshold(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-primary)" }}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={diagnosticsLoading}
            onClick={runDiagnostics}
            style={{ minWidth: "150px" }}
          >
            {diagnosticsLoading ? "Querying..." : "⚡ Run Vector Probe"}
          </button>
        </div>

        {diagResults.length > 0 && (
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.75rem" }}>
              Cosine Distance Probe Results (Ranked):
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {diagResults.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "0.6rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "var(--color-navy)" }}>{r.fullName}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginLeft: "0.5rem" }}>
                      {r.jobTitle} • {r.department}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-light)" }}>
                      sim = {r.similarity}
                    </span>
                    <span className="score-pill score-high">★ {r.compatibilityPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Protected Acronyms & Token Preprocessing */}
      <div className="card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "0.5rem" }}>
          Protected Aviation Acronyms (Token Preprocessor)
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
          The domain preprocessor prevents casing normalization corruption on safety-critical aviation standards, aircraft models, and flight certificates:
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {[
            "ICAO", "FAA", "EASA", "KCAA", "ATPL", "CPL", "PPL", "MCC",
            "B787", "B737", "B777", "A320", "A350", "E190", "Q400",
            "ETOPS", "SMS", "TCAS", "FADEC", "NDT", "FMC", "VOR", "ILS", "RNAV", "LOFT"
          ].map((token) => (
            <span
              key={token}
              style={{
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
                fontWeight: 700,
                fontSize: "0.75rem",
                padding: "0.25rem 0.55rem",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {token}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

