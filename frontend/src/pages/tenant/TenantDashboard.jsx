import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { TicketStatusBadge, PriorityBadge, LeaseStatusBadge } from "../../components/ui/Badge";
import { LoadingRows } from "../../components/ui/EmptyState";
import { useToast, ToastContainer } from "../../components/ui/Toast";

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TenantDashboard() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [profile, setProfile]   = useState(null);
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);

  // Estado del formulario rápido de ticket
  const [showQuickTicket, setShowQuickTicket] = useState(false);
  const [quickDesc, setQuickDesc]             = useState("");
  const [submitting, setSubmitting]           = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const profileData = await apiFetch("/api/tenant/me");
      setProfile(profileData);

      if (profileData?.tenant?._id) {
        const ticketsData = await apiFetch(`/api/tenant/tickets?tenantId=${profileData.tenant._id}`);
        setTickets(ticketsData.tickets || []);
      }
    } catch (err) {
      showToast(err.message || "No se pudo cargar tu perfil", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickTicket(e) {
    e.preventDefault();
    if (!quickDesc.trim()) { showToast("Describe el problema", "error"); return; }
    if (!profile?.activeLease) { showToast("Necesitas un contrato activo", "error"); return; }

    setSubmitting(true);
    try {
      await apiFetch("/api/tenant/tickets", {
        method: "POST",
        body: JSON.stringify({
          tenantId: profile.tenant._id,
          unitId:   profile.activeLease.unitId?._id || profile.activeLease.unitId,
          description: quickDesc.trim(),
        }),
      });
      setQuickDesc("");
      setShowQuickTicket(false);
      showToast("Ticket enviado. Te notificaremos pronto.", "success");
      await loadData(); // refresca el contador
    } catch (err) {
      showToast(err.message || "No se pudo crear el ticket", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "8px 0" }}><LoadingRows count={4} height={80} /></div>;
  }

  const { tenant, activeLease } = profile || {};
  const openCount     = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  // Días hasta vencimiento del contrato
  const daysLeft = activeLease
    ? Math.ceil((new Date(activeLease.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div>
      {/* ── Tarjeta de bienvenida ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "16px",
        background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))",
        border: "1px solid rgba(37,99,235,0.2)",
        borderRadius: "16px", padding: "22px 24px", marginBottom: "24px",
      }}>
        <div style={{
          width: "54px", height: "54px", borderRadius: "50%",
          background: "rgba(37,99,235,0.25)", border: "2px solid rgba(37,99,235,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px", fontWeight: "700", color: "#60a5fa", flexShrink: 0,
        }}>
          {initials(tenant?.fullName)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
            Hola, {firstName(tenant?.fullName)} 👋
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            {tenant?.email}
            {tenant?.phone && <> · {tenant.phone}</>}
          </p>
        </div>
        {/* Métricas rápidas */}
        <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
          <MiniStat label="Tickets abiertos" value={openCount}     color={openCount > 0 ? "#f87171" : "#4ade80"} />
          <MiniStat label="Resueltos"        value={resolvedCount} color="#94a3b8" />
        </div>
      </div>

      {/* ── Contrato activo ── */}
      <SectionTitle>Mi contrato</SectionTitle>

      {activeLease ? (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px", overflow: "hidden",
          marginBottom: "24px",
        }}>
          {/* Header del contrato */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            gap: "16px", padding: "18px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#f1f5f9" }}>
                  {activeLease.propertyId?.name}
                </span>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#94a3b8" }}>—</span>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#f1f5f9" }}>
                  Unidad {activeLease.unitId?.unitNumber}
                </span>
                <LeaseStatusBadge status={activeLease.status} />
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                📍 {activeLease.propertyId?.address || "Dirección no disponible"}
              </p>
            </div>

            {/* Renta destacada */}
            <div style={{
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.15)",
              borderRadius: "12px", padding: "12px 18px",
              textAlign: "right", flexShrink: 0,
            }}>
              <div style={{ fontSize: "11px", color: "#4ade80", marginBottom: "2px", letterSpacing: "0.05em" }}>
                RENTA MENSUAL
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#4ade80", lineHeight: 1 }}>
                ${Number(activeLease.monthlyRent || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Grid de detalles */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1px", background: "rgba(255,255,255,0.05)",
          }}>
            <DetailCell label="Inicio del contrato" value={fmtDate(activeLease.startDate)} />
            <DetailCell label="Vencimiento"         value={fmtDate(activeLease.endDate)} accent={daysLeft !== null && daysLeft < 60} />
            <DetailCell label="Día de pago"         value={`Día ${activeLease.dueDay} de cada mes`} />
            <DetailCell label="Depósito"            value={`$${Number(activeLease.deposit || 0).toLocaleString()}`} />
          </div>

          {/* Alerta de vencimiento próximo */}
          {daysLeft !== null && daysLeft > 0 && daysLeft < 60 && (
            <div style={{
              padding: "12px 20px",
              background: "rgba(251,191,36,0.08)",
              borderTop: "1px solid rgba(251,191,36,0.15)",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{ fontSize: "14px" }}>⚠️</span>
              <span style={{ fontSize: "13px", color: "#fbbf24" }}>
                Tu contrato vence en <strong>{daysLeft} días</strong>. Habla con tu propietario para renovar.
              </span>
            </div>
          )}
          {daysLeft !== null && daysLeft <= 0 && (
            <div style={{
              padding: "12px 20px",
              background: "rgba(239,68,68,0.08)",
              borderTop: "1px solid rgba(239,68,68,0.15)",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{ fontSize: "14px" }}>🔴</span>
              <span style={{ fontSize: "13px", color: "#f87171" }}>
                Tu contrato ha vencido. Contacta a tu propietario.
              </span>
            </div>
          )}
        </div>
      ) : (
        <EmptyBox icon="📄" message="No tienes un contrato activo. Contacta a tu propietario." mb />
      )}

      {/* ── Tickets recientes ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <SectionTitle noMargin>Tickets recientes</SectionTitle>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowQuickTicket(!showQuickTicket)}
            style={{
              background: showQuickTicket ? "rgba(37,99,235,0.15)" : "#2563eb",
              color: showQuickTicket ? "#60a5fa" : "#fff",
              border: showQuickTicket ? "1px solid rgba(37,99,235,0.3)" : "none",
              borderRadius: "8px", padding: "7px 14px",
              fontSize: "12px", fontWeight: "600", cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {showQuickTicket ? "Cancelar" : "+ Reportar problema"}
          </button>
          {tickets.length > 3 && (
            <button
              onClick={() => navigate("/tenant/tickets")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8", borderRadius: "8px",
                padding: "7px 12px", fontSize: "12px", cursor: "pointer",
              }}
            >
              Ver todos →
            </button>
          )}
        </div>
      </div>

      {/* Formulario rápido de ticket */}
      {showQuickTicket && (
        <div style={{
          background: "rgba(37,99,235,0.06)",
          border: "1px solid rgba(37,99,235,0.2)",
          borderRadius: "12px", padding: "18px",
          marginBottom: "16px",
          animation: "fadeIn 0.2s ease",
        }}>
          <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>
          <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#94a3b8" }}>
            Describe el problema y la IA lo clasificará automáticamente.
          </p>
          <form onSubmit={handleQuickTicket} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <textarea
              style={{
                flex: 1, minWidth: "200px", minHeight: "80px", resize: "vertical",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", padding: "10px 12px",
                color: "#f1f5f9", fontSize: "13px", fontFamily: "inherit", outline: "none",
              }}
              placeholder="Ej: El grifo del baño principal tiene una fuga constante desde hace 3 días..."
              value={quickDesc}
              onChange={(e) => setQuickDesc(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "#2563eb", color: "#fff", border: "none",
                borderRadius: "10px", padding: "10px 18px",
                fontSize: "13px", fontWeight: "600", cursor: "pointer",
                alignSelf: "flex-end", opacity: submitting ? 0.7 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {submitting ? "Enviando..." : "Enviar reporte"}
            </button>
          </form>
        </div>
      )}

      {/* Lista de tickets recientes (máx 3) */}
      {tickets.length === 0 ? (
        <EmptyBox icon="✅" message="No tienes tickets. Si tienes un problema, repórtalo arriba." />
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {tickets
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
            .map((ticket) => (
              <TicketRow
                key={ticket._id}
                ticket={ticket}
                onClick={() => navigate("/tenant/tickets")}
              />
            ))}
          {tickets.length > 3 && (
            <button
              onClick={() => navigate("/tenant/tickets")}
              style={{
                background: "transparent",
                border: "1px dashed rgba(255,255,255,0.1)",
                borderRadius: "10px", padding: "12px",
                color: "#64748b", cursor: "pointer", fontSize: "12px",
                width: "100%",
              }}
            >
              Ver los {tickets.length - 3} tickets restantes →
            </button>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionTitle({ children, noMargin }) {
  return (
    <p style={{
      margin: noMargin ? 0 : "0 0 12px",
      fontSize: "11px", fontWeight: "600",
      color: "#64748b",
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      {children}
    </p>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "22px", fontWeight: "800", color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px" }}>{label}</div>
    </div>
  );
}

function DetailCell({ label, value, accent }) {
  return (
    <div style={{
      padding: "14px 18px",
      background: "rgba(255,255,255,0.02)",
    }}>
      <div style={{ fontSize: "10px", color: "#475569", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{
        fontSize: "14px", fontWeight: "600",
        color: accent ? "#fbbf24" : "#cbd5e1",
      }}>
        {value}
      </div>
    </div>
  );
}

function TicketRow({ ticket, onClick }) {
  const BORDER = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: "12px", flexWrap: "wrap",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: `3px solid ${BORDER[ticket.priority] || "#64748b"}`,
        borderRadius: "0 10px 10px 0",
        padding: "12px 14px",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>
          {ticket.title}
        </p>
        <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
          {new Date(ticket.createdAt).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <PriorityBadge priority={ticket.priority} />
        <TicketStatusBadge status={ticket.status} />
      </div>
    </div>
  );
}

function EmptyBox({ icon, message, mb }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "36px 20px",
      background: "rgba(255,255,255,0.02)",
      border: "1px dashed rgba(255,255,255,0.1)",
      borderRadius: "12px", textAlign: "center",
      marginBottom: mb ? "24px" : 0,
    }}>
      <span style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</span>
      <p style={{ margin: 0, color: "#64748b", fontSize: "13px", maxWidth: "280px", lineHeight: 1.6 }}>
        {message}
      </p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name) {
  return name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}
function firstName(name) {
  return name?.split(" ")[0] || "inquilino";
}
function fmtDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
}