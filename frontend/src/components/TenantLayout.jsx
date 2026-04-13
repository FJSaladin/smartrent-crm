import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { apiFetch, clearToken } from "../services/api";

/**
 * TenantLayout — layout del portal del inquilino
 * Es más simple que el AppLayout del landlord, sin sidebar ancho
 */
export default function TenantLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiFetch("/api/auth/me");
        setUser(data.user);
        // Si no es tenant, manda al dashboard del landlord
        if (data.user?.role !== "tenant") {
          navigate("/dashboard");
        }
      } catch {
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
    { to: "/tenant/dashboard", label: "Mi portal",   icon: "🏠" },
    { to: "/tenant/tickets",   label: "Mis tickets",  icon: "🔧" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "white",
      fontFamily: "inherit",
    }}>
      {/* ── Header top bar ── */}
      <header style={{
        height: "60px",
        background: "#111827",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Logo */}
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#f8fafc" }}>
            🏠 SmartRent
          </span>

          {/* Nav links */}
          <nav style={{ display: "flex", gap: "4px" }}>
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    textDecoration: "none",
                    color: active ? "#fff" : "#94a3b8",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: active ? "rgba(37,99,235,0.2)" : "transparent",
                    fontSize: "13px",
                    fontWeight: active ? "600" : "400",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#f1f5f9" }}>
              {user?.name || "Inquilino"}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Portal inquilino</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "7px 12px", borderRadius: "8px",
              border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.08)",
              color: "#f87171", cursor: "pointer",
              fontSize: "12px", fontWeight: "600",
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main style={{ padding: "32px 24px", maxWidth: "800px", margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}