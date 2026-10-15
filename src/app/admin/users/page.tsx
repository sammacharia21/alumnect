"use client";

import React, { useState, useEffect } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [search, selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/users?limit=50`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedRole !== "ALL") url += `&role=${selectedRole}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error("Role update failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user account "${email}"? This will cascade remove their profile and requests.`)) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">User Accounts & Vetting Directory</h1>
        <p className="page-subtitle">
          Manage user credentials, audit aviation profile certifications, and update platform permissions.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search by name, email, department, or job title..."
              style={{
                width: "100%",
                padding: "0.55rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                padding: "0.55rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                background: "white",
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="MENTOR">Mentors Only</option>
              <option value="MENTEE">Mentees Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>
          </div>

          <button type="button" className="btn btn-secondary" onClick={fetchUsers}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
            Loading user directory...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
            No users match the search criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: "0.78rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "0.85rem 1.25rem" }}>Name & Title</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Email Address</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Department & Certs</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Role</th>
                  <th style={{ padding: "0.85rem 1.25rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleBadge =
                    u.role === "ADMIN"
                      ? "badge-rejected"
                      : u.role === "MENTOR"
                      ? "badge-approved"
                      : "badge-dept";

                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ fontWeight: 700, color: "var(--color-navy)" }}>
                          {u.profile?.fullName || "Incomplete Profile"}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                          {u.profile?.jobTitle || "No role specified"} ({u.profile?.yearsExperience ?? 0} yrs)
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <span style={{ color: "var(--color-text)", fontWeight: 500 }}>{u.email}</span>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{u.profile?.department || "Unassigned"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-light)" }}>
                          {u.profile?.certifications ? u.profile.certifications.slice(0, 35) + "..." : "No certs"}
                        </div>
                      </td>

                      <td style={{ padding: "1rem" }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={actionLoading === u.id}
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            padding: "0.25rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-border)",
                            background: u.role === "MENTOR" ? "#ecfdf5" : u.role === "ADMIN" ? "#fef3c7" : "#eff6ff",
                            color: u.role === "MENTOR" ? "#047857" : u.role === "ADMIN" ? "#b45309" : "#1e40af",
                          }}
                        >
                          <option value="MENTEE">MENTEE</option>
                          <option value="MENTOR">MENTOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.email)}
                          disabled={actionLoading === u.id || u.email === "admin@alumnect.dev"}
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--color-danger)",
                            fontWeight: 600,
                            padding: "0.3rem 0.6rem",
                            borderRadius: "var(--radius-sm)",
                            background: "#fee2e2",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

