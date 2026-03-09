import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { apiFetch, clearToken } from "../services/api";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiFetch("/api/auth/me");
        setUser(data.user);
      } catch (err) {
        clearToken();
        navigate("/");
      }
    }

    loadUser();
  }, [navigate]);

  function handleLogout() {
    clearToken();
    navigate("/");
  }

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/properties", label: "Properties" },
    { to: "/units", label: "Units" },
    { to: "/tenants", label: "Tenants" },
    { to: "/leases", label: "Leases" },
    { to: "/tickets", label: "Tickets" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        background: "#0f172a",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <aside
        style={{
          background: "#111827",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: "24px 18px",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ margin: 0 }}>🏠 SmartRent</h2>
          <p style={{ color: "#94a3b8", marginTop: "8px", fontSize: "14px" }}>
            CRM & Property Management
          </p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  textDecoration: "none",
                  color: "white",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: active ? "#2563eb" : "transparent",
                  border: active
                    ? "none"
                    : "1px solid rgba(255,255,255,0.08)",
                  fontWeight: active ? "bold" : "normal",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={{ display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: "72px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            background: "#1e293b",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>SmartRent CRM</h3>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px" }}>
              Bienvenido{user?.name ? `, ${user.name}` : ""}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold" }}>{user?.name || "Usuario"}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                {user?.role || "role"}
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: "#ef4444",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div style={{ padding: "24px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}