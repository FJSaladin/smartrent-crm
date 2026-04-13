import { useEffect, useMemo, useState, useCallback } from "react";
import { apiFetch } from "../services/api";
import { useToast, ToastContainer } from "../components/ui/Toast";
import {
  colors, card, radius, input, field, buttons,
  getPriorityBadge, getStatusBadgeStyle,
} from "../styles/theme";

const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 };

const PRIORITY_LABELS = {
  high:   "🔴 Alta",
  medium: "🟡 Media",
  low:    "🟢 Baja",
};

const STATUS_LABELS = {
  open:        "Abierto",
  in_progress: "En progreso",
  resolved:    "Resuelto",
  closed:      "Cerrado",
};

const STATUS_COLORS = {
  open:        colors.action.danger,
  in_progress: colors.action.warning,
  resolved:    colors.action.success,
  closed:      colors.text.muted,
};

const PRIORITY_BORDER = {
  high:   colors.action.danger,
  medium: colors.action.warning,
  low:    colors.action.success,
};

const CATEGORY_LABELS = {
  plumbing:   "Plomería",
  electrical: "Eléctrico",
  hvac:       "Climatización",
  structural: "Estructural",
  general:    "General",
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Tickets() {
  const [tickets, setTickets]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [savingId, setSavingId]             = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage]     = useState("");
  const [sendingReply, setSendingReply]     = useState(false);

  const [tenantFilter, setTenantFilter]     = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [statusFilter, setStatusFilter]     = useState("");

  const { toasts, showToast, removeToast } = useToast();

  // Cerrar modal con Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setSelectedTicket(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { loadTickets(); }, []);

  async function loadTickets() {
    try {
      const data = await apiFetch("/api/tickets");
      setTickets(data.tickets || []);
    } catch (err) {
      showToast(err.message || "No se pudieron cargar los tickets", "error");
    } finally {
      setLoading(false);
    }
  }

  const tenants = useMemo(() => {
    const map = new Map();
    tickets.forEach((t) => {
      if (t.tenantId?._id) map.set(t.tenantId._id, t.tenantId.fullName || "Inquilino");
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tickets]);

  const properties = useMemo(() => {
    const map = new Map();
    tickets.forEach((t) => {
      if (t.propertyId?._id) map.set(t.propertyId._id, t.propertyId.name || "Propiedad");
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        const okTenant   = !tenantFilter   || t.tenantId?._id   === tenantFilter;
        const okProperty = !propertyFilter || t.propertyId?._id === propertyFilter;
        const okStatus   = !statusFilter   || t.status          === statusFilter;
        return okTenant && okProperty && okStatus;
      })
      .sort((a, b) => {
        const pd = (PRIORITY_ORDER[a.priority] || 99) - (PRIORITY_ORDER[b.priority] || 99);
        return pd !== 0 ? pd : new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [tickets, tenantFilter, propertyFilter, statusFilter]);

  const hasFilters = tenantFilter || propertyFilter || statusFilter;

  async function updateTicketField(ticketId, updates) {
    setSavingId(ticketId);
    try {
      const data = await apiFetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? data.ticket : t)));
      if (selectedTicket?._id === ticketId) setSelectedTicket(data.ticket);
    } catch (err) {
      showToast(err.message || "No se pudo actualizar el ticket", "error");
    } finally {
      setSavingId("");
    }
  }

  async function handleSendEmail() {
    if (!replyMessage.trim()) { showToast("Escribe un mensaje antes de enviar", "error"); return; }
    setSendingReply(true);
    try {
      const data = await apiFetch(`/api/tickets/${selectedTicket._id}/reply-email`, {
        method: "POST",
        body: JSON.stringify({ message: replyMessage.trim() }),
      });
      if (data.ticket) {
        setTickets((prev) => prev.map((t) => (t._id === data.ticket._id ? data.ticket : t)));
        setSelectedTicket(data.ticket);
      }
      setReplyMessage("");
      showToast("Correo enviado correctamente", "success");
    } catch (err) {
      showToast(err.message || "No se pudo enviar el correo", "error");
    } finally {
      setSendingReply(false);
    }
  }

  async function handleSendWhatsApp() {
    if (!replyMessage.trim()) { showToast("Escribe un mensaje antes de enviar", "error"); return; }
    setSendingReply(true);
    try {
      const data = await apiFetch(`/api/tickets/${selectedTicket._id}/notify-whatsapp`, {
        method: "POST",
        body: JSON.stringify({ message: replyMessage.trim() }),
      });
      if (data.ticket) {
        setTickets((prev) => prev.map((t) => (t._id === data.ticket._id ? data.ticket : t)));
        setSelectedTicket(data.ticket);
      }
      setReplyMessage("");
      showToast("Notificación de WhatsApp enviada", "success");
    } catch (err) {
      showToast(err.message || "No se pudo enviar el WhatsApp", "error");
    } finally {
      setSendingReply(false);
    }
  }

  return (
    <div>
      {/* ── Encabezado ── */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "26px" }}>Tickets</h1>
        <p style={{ color: colors.text.secondary, margin: "6px 0 0" }}>
          Gestiona los reportes de mantenimiento de tus propiedades
        </p>
      </div>

      {/* ── Filtros ── */}
      <div style={{
        ...card,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto",
        gap: "16px",
        alignItems: "end",
        marginBottom: "24px",
      }}>
        <div style={field}>
          <label style={labelStyle}>Inquilino</label>
          <select style={selectStyle} value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)}>
            <option value="">Todos</option>
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div style={field}>
          <label style={labelStyle}>Propiedad</label>
          <select style={selectStyle} value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}>
            <option value="">Todas</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={field}>
          <label style={labelStyle}>Estado</label>
          <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="open">Abierto</option>
            <option value="in_progress">En progreso</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>

        {hasFilters && (
          <button
            style={{ ...buttons.neutral, whiteSpace: "nowrap" }}
            onClick={() => { setTenantFilter(""); setPropertyFilter(""); setStatusFilter(""); }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Contador ── */}
      {!loading && (
        <p style={{ color: colors.text.muted, fontSize: "13px", marginBottom: "16px" }}>
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
          {hasFilters ? " encontrados" : " en total"}
        </p>
      )}

      {/* ── Lista ── */}
      {loading ? (
        <p style={{ color: colors.text.muted }}>Cargando tickets...</p>
      ) : filteredTickets.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h3 style={{ margin: "0 0 8px", color: colors.text.primary }}>No hay tickets pendientes</h3>
          <p style={{ margin: 0, color: colors.text.muted }}>
            {hasFilters ? "Prueba cambiando los filtros" : "Todo está en orden"}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              style={{
                ...card,
                borderLeft: `4px solid ${PRIORITY_BORDER[ticket.priority] || colors.border.default}`,
                padding: 0,
                overflow: "hidden",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
                padding: "18px 20px",
              }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "15px" }}>{ticket.title}</h3>
                    <span style={getPriorityBadge(ticket.priority)}>
                      {PRIORITY_LABELS[ticket.priority]}
                    </span>
                    <span style={getStatusBadgeStyle(STATUS_COLORS[ticket.status])}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", color: colors.text.secondary }}>
                    👤 {ticket.tenantId?.fullName || "N/D"} &nbsp;·&nbsp;
                    🏢 {ticket.propertyId?.name   || "N/D"} &nbsp;·&nbsp;
                    🚪 Unidad {ticket.unitId?.unitNumber || "N/D"}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: colors.text.muted }}>
                    {CATEGORY_LABELS[ticket.category] || ticket.category} &nbsp;·&nbsp;
                    {new Date(ticket.createdAt).toLocaleDateString("es-DO", {
                      day: "numeric", month: "short", year: "numeric",
                    })} &nbsp;·&nbsp;
                    Vía {ticket.source === "whatsapp" ? "WhatsApp" : "Dashboard"}
                  </p>
                </div>

                {/* Controles rápidos */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    style={{ ...selectStyle, width: "140px" }}
                    value={ticket.priority}
                    disabled={savingId === ticket._id}
                    onChange={(e) => updateTicketField(ticket._id, { priority: e.target.value })}
                  >
                    <option value="high">🔴 Alta</option>
                    <option value="medium">🟡 Media</option>
                    <option value="low">🟢 Baja</option>
                  </select>

                  <select
                    style={{ ...selectStyle, width: "150px" }}
                    value={ticket.status}
                    disabled={savingId === ticket._id}
                    onChange={(e) => updateTicketField(ticket._id, { status: e.target.value })}
                  >
                    <option value="open">Abierto</option>
                    <option value="in_progress">En progreso</option>
                    <option value="resolved">Resuelto</option>
                    <option value="closed">Cerrado</option>
                  </select>

                  <button
                    style={buttons.primary}
                    onClick={() => { setSelectedTicket(ticket); setReplyMessage(""); }}
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal de detalle ── */}
      {selectedTicket && (
        <div style={overlayStyle} onClick={() => setSelectedTicket(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <span style={getPriorityBadge(selectedTicket.priority)}>
                    {PRIORITY_LABELS[selectedTicket.priority]}
                  </span>
                  <span style={getStatusBadgeStyle(STATUS_COLORS[selectedTicket.status])}>
                    {STATUS_LABELS[selectedTicket.status]}
                  </span>
                </div>
                <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>{selectedTicket.title}</h2>
                <p style={{ margin: 0, fontSize: "12px", color: colors.text.muted }}>
                  ID: {selectedTicket._id}
                </p>
              </div>
              <button
                style={{ ...buttons.neutral, marginLeft: "16px" }}
                onClick={() => setSelectedTicket(null)}
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Info grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: radius.lg,
              padding: "16px",
            }}>
              <InfoRow label="Inquilino"  value={selectedTicket.tenantId?.fullName} />
              <InfoRow label="Email"      value={selectedTicket.tenantId?.email} />
              <InfoRow label="Teléfono"   value={selectedTicket.tenantId?.phone} />
              <InfoRow label="Propiedad"  value={selectedTicket.propertyId?.name} />
              <InfoRow label="Categoría"  value={CATEGORY_LABELS[selectedTicket.category] || selectedTicket.category} />
              <InfoRow label="Fecha"      value={new Date(selectedTicket.createdAt).toLocaleDateString("es-DO", {
                day: "numeric", month: "long", year: "numeric",
              })} />
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: "20px" }}>
              <p style={labelStyle}>Descripción</p>
              <p style={{ margin: 0, color: colors.text.secondary, fontSize: "14px", lineHeight: 1.6 }}>
                {selectedTicket.description}
              </p>
            </div>

            {selectedTicket.notes && (
              <div style={{ marginBottom: "20px" }}>
                <p style={labelStyle}>Notas internas</p>
                <p style={{ margin: 0, color: colors.text.secondary, fontSize: "14px" }}>
                  {selectedTicket.notes}
                </p>
              </div>
            )}

            {/* Historial de comunicaciones */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ ...labelStyle, marginBottom: "12px" }}>
                Historial de comunicaciones ({selectedTicket.communications?.length || 0})
              </p>
              {!selectedTicket.communications?.length ? (
                <p style={{ color: colors.text.muted, fontSize: "13px" }}>
                  Aún no hay comunicaciones registradas
                </p>
              ) : (
                <div style={{ display: "grid", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>
                  {[...selectedTicket.communications]
                    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
                    .map((comm, i) => (
                      <div
                        key={i}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: radius.md,
                          padding: "12px 14px",
                          borderLeft: `3px solid ${comm.channel === "email" ? colors.action.primary : colors.action.whatsapp}`,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{
                            fontSize: "12px", fontWeight: "bold",
                            color: comm.channel === "email" ? colors.action.primary : colors.action.whatsapp,
                          }}>
                            {comm.channel === "email" ? "📧 Email" : "💬 WhatsApp"}
                          </span>
                          <span style={{ fontSize: "11px", color: colors.text.muted }}>
                            {new Date(comm.sentAt).toLocaleString("es-DO")}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: colors.text.secondary }}>
                          {comm.message}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Área de respuesta */}
            <div style={{ borderTop: `1px solid ${colors.border.subtle}`, paddingTop: "20px" }}>
              <p style={labelStyle}>Enviar mensaje al inquilino</p>
              <textarea
                style={{ ...input, minHeight: "100px", resize: "vertical", marginBottom: "12px" }}
                placeholder="Escribe aquí el mensaje para el inquilino..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  style={{ ...buttons.primary, opacity: sendingReply ? 0.7 : 1 }}
                  disabled={sendingReply}
                  onClick={handleSendEmail}
                >
                  📧 Enviar por email
                </button>
                <button
                  style={{ ...buttons.whatsapp, opacity: sendingReply ? 0.7 : 1 }}
                  disabled={sendingReply}
                  onClick={handleSendWhatsApp}
                >
                  💬 Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div>
      <p style={{ margin: "0 0 2px", fontSize: "11px", color: colors.text.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: "14px", color: colors.text.secondary }}>
        {value || "N/D"}
      </p>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const labelStyle = {
  fontSize: "12px",
  color: colors.text.muted,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  margin: "0 0 6px",
};

const selectStyle = {
  ...input,
  cursor: "pointer",
  background: colors.bg.secondary,
  color: colors.text.primary,
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: colors.bg.overlay,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalStyle = {
  width: "100%",
  maxWidth: "780px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: colors.bg.secondary,
  border: `1px solid ${colors.border.default}`,
  borderRadius: radius.xxl,
  padding: "28px",
  color: colors.text.primary,
};