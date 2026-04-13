import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { colors, radius } from "../styles/theme";
import { PriorityBadge, TicketStatusBadge } from "../components/ui/Badge";
import { LoadingRows } from "../components/ui/EmptyState";
import { useToast, ToastContainer } from "../components/ui/Toast";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sublabel, icon, color, alert, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: radius.xl,
        padding: "18px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {/* Barra de color superior */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: color,
        borderRadius: `${radius.xl} ${radius.xl} 0 0`,
      }} />

      <div style={{ fontSize: "26px", marginBottom: "10px" }}>{icon}</div>

      <div style={{ fontSize: "30px", fontWeight: "800", color, lineHeight: 1 }}>
        {value}
      </div>

      <div style={{ fontSize: "13px", color: colors.text.secondary, marginTop: "6px" }}>
        {label}
        {sublabel && <span style={{ color: colors.text.muted }}> {sublabel}</span>}
      </div>

      {alert && (
        <div style={{
          marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "600",
          background: "rgba(239,68,68,0.15)", color: "#f87171",
          border: "1px solid rgba(239,68,68,0.25)",
        }}>
          ⚠ {alert}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [stats, setStats] = useState({
    properties: 0,
    units: { total: 0, occupied: 0 },
    tenants: 0,
    leases: { active: 0 },
    tickets: { open: 0, high: 0 },
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const [propsRes, tenantsRes, leasesRes, ticketsRes] = await Promise.all([
        apiFetch("/api/properties"),
        apiFetch("/api/tenants"),
        apiFetch("/api/leases"),
        apiFetch("/api/tickets"),
      ]);

      const properties = propsRes.properties   || [];
      const tenants    = tenantsRes.tenants     || [];
      const leases     = leasesRes.leases       || [];
      const tickets    = ticketsRes.tickets     || [];

      // Carga unidades de todas las propiedades en paralelo
      const unitResults = await Promise.all(
        properties.map((p) =>
          apiFetch(`/api/properties/${p._id}/units`).then((r) => r.units || [])
        )
      );
      const allUnits = unitResults.flat();

      setStats({
        properties: properties.length,
        units: {
          total: allUnits.length,
          occupied: allUnits.filter((u) => u.status === "occupied").length,
        },
        tenants: tenants.length,
        leases: { active: leases.filter((l) => l.status === "active").length },
        tickets: {
          open: tickets.filter((t) => t.status === "open").length,
          high: tickets.filter((t) => t.priority === "high" && t.status === "open").length,
        },
      });

      // Tickets pendientes ordenados por prioridad
      const ORDER = { high: 1, medium: 2, low: 3 };
      const pending = [...tickets]
        .filter((t) => t.status === "open" || t.status === "in_progress")
        .sort((a, b) => (ORDER[a.priority] || 9) - (ORDER[b.priority] || 9))
        .slice(0, 4);

      setRecentTickets(pending);
    } catch (err) {
      showToast(err.message || "Error cargando estadísticas", "error");
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Propiedades",      value: stats.properties,                                  icon: "🏢", color: colors.action.primary,  route: "/properties" },
    { label: "Unidades",         value: `${stats.units.occupied}/${stats.units.total}`,    icon: "🚪", color: colors.action.success,  route: "/units",      sublabel: "ocupadas" },
    { label: "Inquilinos",       value: stats.tenants,                                     icon: "👥", color: colors.action.warning,  route: "/tenants" },
    { label: "Contratos activos",value: stats.leases.active,                               icon: "📄", color: "#8b5cf6",              route: "/leases" },
    {
      label: "Tickets abiertos", value: stats.tickets.open,                                icon: "🔧",
      color: stats.tickets.high > 0 ? colors.action.danger : colors.action.success,
      route: "/tickets",
      alert: stats.tickets.high > 0 ? `${stats.tickets.high} urgentes` : null,
    },
  ];

  return (
    <div>
      {/* ── Encabezado ── */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#f8fafc" }}>
          Dashboard
        </h1>
        <p style={{ margin: "6px 0 0", color: colors.text.secondary, fontSize: "14px" }}>
          Resumen general de tu gestión inmobiliaria
        </p>
      </div>

      {loading ? (
        <LoadingRows count={5} height={110} />
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}>
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} onClick={() => navigate(s.route)} />
            ))}
          </div>

          {/* ── Tickets pendientes ── */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: radius.xl,
            padding: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#f1f5f9" }}>
                Tickets pendientes
              </h2>
              <button
                onClick={() => navigate("/tickets")}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: colors.text.secondary,
                  borderRadius: radius.md,
                  padding: "7px 14px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Ver todos →
              </button>
            </div>

            {recentTickets.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "36px 20px",
                color: colors.text.muted,
              }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>✅</div>
                <p style={{ margin: 0, fontSize: "14px" }}>No hay tickets pendientes</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: radius.lg,
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderLeft: `3px solid ${
                        ticket.priority === "high" ? "#ef4444"
                        : ticket.priority === "medium" ? "#f59e0b"
                        : "#22c55e"
                      }`,
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <p style={{ margin: "0 0 3px", fontWeight: "600", fontSize: "14px", color: "#f1f5f9" }}>
                        {ticket.title}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: colors.text.muted }}>
                        {ticket.tenantId?.fullName || "N/D"} — {ticket.propertyId?.name || "N/D"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <PriorityBadge priority={ticket.priority} />
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}