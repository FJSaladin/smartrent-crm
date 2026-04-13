import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { colors, card, radius, shadows, getStatusBadgeStyle, getPriorityBadge } from "../styles/theme";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    properties: 0,
    units: { total: 0, occupied: 0, vacant: 0 },
    tenants: 0,
    tickets: { total: 0, open: 0, high: 0 },
    leases: { total: 0, active: 0 },
  });

  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [propertiesRes, tenantsRes, leasesRes, ticketsRes] =
          await Promise.all([
            apiFetch("/api/properties"),
            apiFetch("/api/tenants"),
            apiFetch("/api/leases"),
            apiFetch("/api/tickets"),
          ]);

        const properties = propertiesRes.properties || [];
        const tenants = tenantsRes.tenants || [];
        const leases = leasesRes.leases || [];
        const tickets = ticketsRes.tickets || [];

        // Cargar todas las unidades de todas las propiedades
        const unitsResults = await Promise.all(
          properties.map((p) =>
            apiFetch(`/api/properties/${p._id}/units`).then(
              (r) => r.units || []
            )
          )
        );
        const allUnits = unitsResults.flat();

        setStats({
          properties: properties.length,
          units: {
            total: allUnits.length,
            occupied: allUnits.filter((u) => u.status === "occupied").length,
            vacant: allUnits.filter((u) => u.status === "vacant").length,
          },
          tenants: tenants.length,
          tickets: {
            total: tickets.length,
            open: tickets.filter((t) => t.status === "open").length,
            high: tickets.filter(
              (t) => t.priority === "high" && t.status === "open"
            ).length,
          },
          leases: {
            total: leases.length,
            active: leases.filter((l) => l.status === "active").length,
          },
        });

        // Tickets recientes de alta prioridad o abiertos
        const sorted = [...tickets]
          .filter((t) => t.status === "open" || t.status === "in_progress")
          .sort((a, b) => {
            const order = { high: 1, medium: 2, low: 3 };
            return order[a.priority] - order[b.priority];
          })
          .slice(0, 4);

        setRecentTickets(sorted);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      label: "Propiedades",
      value: stats.properties,
      icon: "🏢",
      color: colors.action.primary,
      route: "/properties",
    },
    {
      label: "Unidades",
      value: `${stats.units.occupied}/${stats.units.total}`,
      sublabel: "ocupadas",
      icon: "🚪",
      color: colors.action.success,
      route: "/units",
    },
    {
      label: "Inquilinos",
      value: stats.tenants,
      icon: "👥",
      color: colors.action.warning,
      route: "/tenants",
    },
    {
      label: "Contratos activos",
      value: stats.leases.active,
      icon: "📄",
      color: "#8b5cf6",
      route: "/leases",
    },
    {
      label: "Tickets abiertos",
      value: stats.tickets.open,
      icon: "🔧",
      color: stats.tickets.high > 0 ? colors.action.danger : colors.action.success,
      route: "/tickets",
      alert: stats.tickets.high > 0 ? `${stats.tickets.high} urgentes` : null,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "26px" }}>Dashboard</h1>
        <p style={{ color: colors.text.secondary, margin: "6px 0 0" }}>
          Resumen general de tu gestión inmobiliaria
        </p>
      </div>

      {loading ? (
        <p style={{ color: colors.text.muted }}>Cargando estadísticas...</p>
      ) : (
        <>
          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {statCards.map((stat) => (
              <div
                key={stat.label}
                onClick={() => navigate(stat.route)}
                style={{
                  ...card,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                {/* Barra de color superior */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: stat.color,
                    borderRadius: `${radius.xl} ${radius.xl} 0 0`,
                  }}
                />

                <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                  {stat.icon}
                </div>

                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "800",
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: colors.text.secondary,
                    marginTop: "6px",
                  }}
                >
                  {stat.label}
                  {stat.sublabel && (
                    <span style={{ color: colors.text.muted }}>
                      {" "}
                      {stat.sublabel}
                    </span>
                  )}
                </div>

                {stat.alert && (
                  <div
                    style={{
                      marginTop: "10px",
                      ...getStatusBadgeStyle(colors.action.danger),
                    }}
                  >
                    ⚠️ {stat.alert}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tickets urgentes */}
          <div style={{ ...card }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px" }}>
                Tickets pendientes
              </h2>
              <button
                onClick={() => navigate("/tickets")}
                style={{
                  background: "transparent",
                  border: `1px solid ${colors.border.default}`,
                  color: colors.text.secondary,
                  borderRadius: radius.md,
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Ver todos →
              </button>
            </div>

            {recentTickets.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: colors.text.muted,
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
                <p style={{ margin: 0 }}>No hay tickets pendientes</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 16px",
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: radius.lg,
                      border: `1px solid ${colors.border.subtle}`,
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        {ticket.title}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: colors.text.muted,
                        }}
                      >
                        {ticket.tenantId?.fullName || "N/D"} —{" "}
                        {ticket.propertyId?.name || "N/D"}
                      </p>
                    </div>

                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      <span style={getPriorityBadge(ticket.priority)}>
                        {ticket.priority === "high"
                          ? "🔴 Alta"
                          : ticket.priority === "medium"
                          ? "🟡 Media"
                          : "🟢 Baja"}
                      </span>
                      <span
                        style={getStatusBadgeStyle(
                          ticket.status === "open"
                            ? colors.action.danger
                            : colors.action.warning
                        )}
                      >
                        {ticket.status === "open" ? "Abierto" : "En progreso"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}