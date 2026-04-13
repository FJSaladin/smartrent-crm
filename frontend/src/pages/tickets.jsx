import { useEffect, useMemo, useState, useCallback } from "react";
import { apiFetch } from "../services/api";
import { useToast, ToastContainer } from "../components/ui/Toast";
import { PriorityBadge, TicketStatusBadge } from "../components/ui/Badge";
import { EmptyTickets, LoadingRows } from "../components/ui/EmptyState";
import { colors, radius } from "../styles/theme";
import {
  pageCard, formInput, labelStyle, sectionHeader, sectionTitle,
} from "../components/ui/formStyles";

// ─── Orden de prioridad ───────────────────────────────────────────────────────
const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 };

const PRIORITY_BORDER = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#22c55e",
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
  const [tickets, setTickets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [savingId, setSavingId]         = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Filtros
  const [tenantFilter, setTenantFilter]     = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [statusFilter, setStatusFilter]     = useState("");

  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => { loadTickets(); }, []);

  // Cierra el modal con Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setSelectedTicket(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  // Opciones únicas para los filtros
  const tenants = useMemo(() => {
    const map = new Map();
    tickets.forEach((t) => {
      if (t.tenantId?._id) map.set(t.tenantId._id, t.tenantId.fullName || "Tenant");
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

  // Tickets filtrados y ordenados
  const filtered = useMemo(() => {
    return tickets
      .filter((t) => {
        const okTenant   = !tenantFilter   || t.tenantId?._id   === tenantFilter;
        const okProperty = !propertyFilter || t.propertyId?._id === propertyFilter;
        const okStatus   = !statusFilter   || t.status          === statusFilter;
        return okTenant && okProperty && okStatus;
      })
      .sort((a, b) => {
        const pd = (PRIORITY_ORDER[a.priority] || 9) - (PRIORITY_ORDER[b.priority] || 9);
        return pd !== 0 ? pd : new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [tickets, tenantFilter, propertyFilter, statusFilter]);

  // Actualiza campo de un ticket (prioridad o estado)
  async function updateField(ticketId, updates) {
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

  // Envía respuesta por email
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

  // Envía notificación por WhatsApp
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

  function clearFilters() {
    setTenantFilter(""); setPropertyFilter(""); setStatusFilter("");
  }

  const hasFilters = tenantFilter || propertyFilter || statusFilter;

  return (
    <div>
      {/* ── Encabezado ── */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#f8fafc" }}>Tickets</h1>
        <p style={{ margin: "6px 0 0", fontSize: "14px", color: colors.text.secondary }}>
          Gestiona las solicitudes de mantenimiento de tus propiedades.
        </p>
      </div>

      {/* ── Filtros ── */}
      <div style={{ ...pageCard, marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", alignItems: "flex-end" }}>
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: "6px" }}>Inquilino</label>
            <select style={formInput} value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)}>
              <option value="">Todos</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: "6px" }}>Propiedad</label>
            <select style={formInput} value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}>
              <option value="">Todas</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...labelStyle, display: "block", marginBottom: "6px" }}>Estado</label>
            <select style={formInput} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="open">Abierto</option>
              <option value="in_progress">En progreso</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: colors.text.secondary,
                borderRadius: radius.md,
                padding: "11px 14px",
                cursor: "pointer",
                fontSize: "13px",
                whiteSpace: "nowrap",
              }}
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* Contador de resultados */}
        <div style={{ marginTop: "12px", fontSize: "12px", color: colors.text.muted }}>
          {hasFilters
            ? `${filtered.length} de ${tickets.length} tickets`
            : `${tickets.length} tickets en total`}
        </div>
      </div>

      {/* ── Lista de tickets ── */}
      {loading ? (
        <LoadingRows count={3} height={100} />
      ) : filtered.length === 0 ? (
        <EmptyTickets />
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {filtered.map((ticket) => (
            <TicketRow
              key={ticket._id}
              ticket={ticket}
              saving={savingId === ticket._id}
              onUpdate={(updates) => updateField(ticket._id, updates)}
              onOpen={() => { setSelectedTicket(ticket); setReplyMessage(""); }}
            />
          ))}
        </div>
      )}

      {/* ── Modal de detalle ── */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          replyMessage={replyMessage}
          onReplyChange={setReplyMessage}
          sendingReply={sendingReply}
          onSendEmail={handleSendEmail}
          onSendWhatsApp={handleSendWhatsApp}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// ─── TicketRow ────────────────────────────────────────────────────────────────
function TicketRow({ ticket, saving, onUpdate, onOpen }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderLeft: `3px solid ${PRIORITY_BORDER[ticket.priority] || "#64748b"}`,
      borderRadius: `0 ${radius.xl} ${radius.xl} 0`,
      padding: "16px 20px",
      display: "flex",
      justifyContent: "space-between",
      gap: "20px",
      flexWrap: "wrap",
      alignItems: "center",
    }}>
      {/* Info */}
      <div style={{ flex: 1, minWidth: "240px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>{ticket.title}</span>
          <PriorityBadge priority={ticket.priority} />
          <TicketStatusBadge status={ticket.status} />
        </div>
        <p style={{ margin: "0 0 3px", fontSize: "12px", color: colors.text.muted }}>
          {ticket.tenantId?.fullName || "N/D"} — {ticket.propertyId?.name || "N/D"}, Unidad {ticket.unitId?.unitNumber || "N/D"}
        </p>
        <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>
          {CATEGORY_LABELS[ticket.category] || ticket.category} ·{" "}
          {new Date(ticket.createdAt).toLocaleDateString("es-DO")} ·{" "}
          {ticket.source === "whatsapp" ? "💬 WhatsApp" : "🖥 Dashboard"}
        </p>
      </div>

      {/* Controles rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", minWidth: "200px" }}>
        <div>
          <label style={{ ...labelStyle, display: "block", marginBottom: "4px", fontSize: "11px" }}>Prioridad</label>
          <select
            style={{ ...formInput, padding: "7px 10px", fontSize: "12px" }}
            value={ticket.priority}
            disabled={saving}
            onChange={(e) => onUpdate({ priority: e.target.value })}
          >
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
        <div>
          <label style={{ ...labelStyle, display: "block", marginBottom: "4px", fontSize: "11px" }}>Estado</label>
          <select
            style={{ ...formInput, padding: "7px 10px", fontSize: "12px" }}
            value={ticket.status}
            disabled={saving}
            onChange={(e) => onUpdate({ status: e.target.value })}
          >
            <option value="open">Abierto</option>
            <option value="in_progress">En progreso</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
        <button
          onClick={onOpen}
          style={{
            gridColumn: "1 / -1",
            background: "#2563eb", color: "#fff",
            border: "none", borderRadius: radius.md,
            padding: "8px", fontSize: "12px", fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Ver detalle →
        </button>
      </div>
    </div>
  );
}

// ─── TicketModal ──────────────────────────────────────────────────────────────
function TicketModal({ ticket, replyMessage, onReplyChange, sendingReply, onSendEmail, onSendWhatsApp, onClose }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: "700px",
          maxHeight: "90vh", overflowY: "auto",
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px", padding: "24px",
          color: "white",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
              <PriorityBadge priority={ticket.priority} />
              <TicketStatusBadge status={ticket.status} />
            </div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#f1f5f9" }}>
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: radius.md, padding: "7px 12px",
              color: "#94a3b8", cursor: "pointer", fontSize: "12px", flexShrink: 0,
            }}
          >
            Cerrar (Esc)
          </button>
        </div>

        {/* Datos del ticket */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px",
          marginBottom: "20px", padding: "16px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: radius.lg,
        }}>
          <ModalInfo label="Inquilino"     value={ticket.tenantId?.fullName} />
          <ModalInfo label="Email"         value={ticket.tenantId?.email} />
          <ModalInfo label="Teléfono"      value={ticket.tenantId?.phone} />
          <ModalInfo label="Propiedad"     value={ticket.propertyId?.name} />
          <ModalInfo label="Unidad"        value={ticket.unitId?.unitNumber} />
          <ModalInfo label="Categoría"     value={CATEGORY_LABELS[ticket.category] || ticket.category} />
          <ModalInfo label="Origen"        value={ticket.source === "whatsapp" ? "💬 WhatsApp" : "🖥 Dashboard"} />
          <ModalInfo label="Fecha"         value={new Date(ticket.createdAt).toLocaleString("es-DO")} />
        </div>

        <ModalInfo label="Descripción" value={ticket.description} />
        {ticket.notes && <ModalInfo label="Notas internas" value={ticket.notes} />}

        {/* Historial de comunicaciones */}
        {ticket.communications?.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <p style={{
              margin: "0 0 10px", fontSize: "12px", fontWeight: "600",
              color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              Historial de comunicaciones
            </p>
            <div style={{ display: "grid", gap: "8px" }}>
              {[...ticket.communications]
                .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
                .map((c, i) => (
                  <div key={i} style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${c.channel === "email" ? "rgba(37,99,235,0.2)" : "rgba(34,197,94,0.2)"}`,
                    borderRadius: radius.md,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: "700",
                        color: c.channel === "email" ? "#60a5fa" : "#4ade80",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        {c.channel === "email" ? "📧 Email" : "💬 WhatsApp"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#475569" }}>
                        {new Date(c.sentAt).toLocaleString("es-DO")}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1" }}>{c.message}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Enviar respuesta */}
        <div style={{ marginTop: "20px" }}>
          <p style={{
            margin: "0 0 8px", fontSize: "12px", fontWeight: "600",
            color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Enviar mensaje al inquilino
          </p>
          <textarea
            style={{
              width: "100%", minHeight: "110px", resize: "vertical",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: radius.md, padding: "12px 14px",
              color: "#f1f5f9", fontSize: "13px", fontFamily: "inherit",
              outline: "none",
            }}
            placeholder="Escribe aquí el mensaje para el inquilino..."
            value={replyMessage}
            onChange={(e) => onReplyChange(e.target.value)}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
            <button
              onClick={onSendEmail}
              disabled={sendingReply}
              style={{
                background: "#2563eb", color: "#fff",
                border: "none", borderRadius: radius.md,
                padding: "10px 18px", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", opacity: sendingReply ? 0.7 : 1,
              }}
            >
              📧 Enviar por email
            </button>
            <button
              onClick={onSendWhatsApp}
              disabled={sendingReply}
              style={{
                background: "#16a34a", color: "#fff",
                border: "none", borderRadius: radius.md,
                padding: "10px 18px", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", opacity: sendingReply ? 0.7 : 1,
              }}
            >
              💬 Enviar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ModalInfo ────────────────────────────────────────────────────────────────
function ModalInfo({ label, value }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.45 }}>
        {value || "—"}
      </p>
    </div>
  );
}