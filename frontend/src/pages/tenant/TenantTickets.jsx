import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import { TicketStatusBadge, PriorityBadge } from "../../components/ui/Badge";
import { LoadingRows } from "../../components/ui/EmptyState";
import { useToast, ToastContainer } from "../../components/ui/Toast";

// ─── Configuración ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "plumbing",    label: "🔧 Plomería",       hint: "Fugas, grifos, tuberías" },
  { value: "electrical",  label: "⚡ Eléctrico",       hint: "Apagones, enchufes, circuitos" },
  { value: "hvac",        label: "❄️ Climatización",   hint: "AC, calefacción, ventilación" },
  { value: "structural",  label: "🏗️ Estructural",    hint: "Paredes, techo, puertas" },
  { value: "general",     label: "📦 General",         hint: "Otros problemas" },
];

const PRIORITY_BORDER = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

const CHANNEL_STYLES = {
  email:    { color: "#60a5fa", bg: "rgba(37,99,235,0.08)",  border: "rgba(37,99,235,0.2)",  icon: "📧" },
  whatsapp: { color: "#4ade80", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)",  icon: "💬" },
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TenantTickets() {
  const { toasts, showToast, removeToast } = useToast();

  const [profile, setProfile]     = useState(null);
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario
  const [desc, setDesc]         = useState("");
  const [category, setCategory] = useState("general");
  const [title, setTitle]       = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const profileData = await apiFetch("/api/tenant/me");
      setProfile(profileData);

      if (profileData?.tenant?._id) {
        const data = await apiFetch(`/api/tenant/tickets?tenantId=${profileData.tenant._id}`);
        setTickets(data.tickets || []);
      }
    } catch (err) {
      showToast(err.message || "No se pudo cargar la información", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!desc.trim()) { showToast("La descripción es obligatoria", "error"); return; }
    if (!profile?.activeLease) { showToast("Necesitas un contrato activo para crear tickets", "error"); return; }

    setSubmitting(true);
    try {
      await apiFetch("/api/tenant/tickets", {
        method: "POST",
        body: JSON.stringify({
          tenantId:    profile.tenant._id,
          unitId:      profile.activeLease.unitId?._id || profile.activeLease.unitId,
          description: desc.trim(),
          category,
          title:       title.trim() || undefined,
        }),
      });
      setDesc(""); setTitle(""); setCategory("general");
      setShowForm(false);
      showToast("Ticket enviado. Te avisaremos cuando haya novedades.", "success");
      await loadData();
    } catch (err) {
      showToast(err.message || "No se pudo crear el ticket", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const openTickets   = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const closedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed");

  return (
    <div>
      {/* ── Header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: "12px",
        marginBottom: "24px", flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "700", color: "#f8fafc" }}>
            Mis tickets
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Reporta problemas y haz seguimiento de solicitudes de mantenimiento.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSelected(null); }}
          style={{
            background: showForm ? "rgba(37,99,235,0.12)" : "#2563eb",
            color: showForm ? "#60a5fa" : "#fff",
            border: showForm ? "1px solid rgba(37,99,235,0.3)" : "none",
            borderRadius: "10px", padding: "10px 16px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {showForm ? "✕ Cancelar" : "+ Nuevo ticket"}
        </button>
      </div>

      {/* ── Formulario de nuevo ticket ── */}
      {showForm && (
        <div style={{
          background: "rgba(37,99,235,0.06)",
          border: "1px solid rgba(37,99,235,0.2)",
          borderRadius: "14px", padding: "20px",
          marginBottom: "24px",
          animation: "fadeIn 0.2s ease",
        }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

          <h2 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>
            Reportar un problema
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Selector de categoría visual */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelSt}>Tipo de problema</label>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "8px", marginTop: "8px",
              }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    style={{
                      background: category === cat.value
                        ? "rgba(37,99,235,0.2)"
                        : "rgba(255,255,255,0.04)",
                      border: category === cat.value
                        ? "1px solid rgba(37,99,235,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      padding: "10px 8px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "600", color: category === cat.value ? "#60a5fa" : "#cbd5e1", marginBottom: "2px" }}>
                      {cat.label}
                    </div>
                    <div style={{ fontSize: "10px", color: "#475569" }}>{cat.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Título (opcional) */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelSt}>Título breve (opcional)</label>
              <input
                style={inputSt}
                type="text"
                placeholder="Ej: Fuga de agua en baño principal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelSt}>
                Descripción del problema <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                style={{ ...inputSt, minHeight: "110px", resize: "vertical" }}
                placeholder="Describe el problema con el mayor detalle posible: cuándo empezó, dónde está exactamente, qué tan urgente es..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#475569" }}>
                La IA analizará tu descripción y asignará prioridad automáticamente.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "#2563eb", color: "#fff", border: "none",
                borderRadius: "10px", padding: "11px 22px",
                fontSize: "13px", fontWeight: "600", cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Enviando..." : "Enviar reporte"}
            </button>
          </form>
        </div>
      )}

      {/* ── Lista de tickets ── */}
      {loading ? (
        <LoadingRows count={3} height={88} />
      ) : tickets.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "52px 24px", textAlign: "center",
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(255,255,255,0.1)",
          borderRadius: "14px",
        }}>
          <span style={{ fontSize: "36px", marginBottom: "12px" }}>📭</span>
          <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>Sin tickets</p>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b", maxWidth: "260px", lineHeight: 1.6 }}>
            Cuando tengas un problema, usa el botón de arriba para reportarlo.
          </p>
        </div>
      ) : (
        <>
          {/* Tickets pendientes */}
          {openTickets.length > 0 && (
            <TicketGroup
              title={`Pendientes · ${openTickets.length}`}
              tickets={openTickets}
              selected={selected}
              onSelect={setSelected}
            />
          )}

          {/* Separador */}
          {openTickets.length > 0 && closedTickets.length > 0 && (
            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />
          )}

          {/* Historial */}
          {closedTickets.length > 0 && (
            <TicketGroup
              title={`Historial · ${closedTickets.length}`}
              tickets={closedTickets}
              selected={selected}
              onSelect={setSelected}
              dimmed
            />
          )}
        </>
      )}

      {/* ── Panel de detalle (inline, sin modal) ── */}
      {selected && (
        <TicketDetail
          ticket={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// ─── TicketGroup ──────────────────────────────────────────────────────────────
function TicketGroup({ title, tickets, selected, onSelect, dimmed = false }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <p style={{
        margin: "0 0 10px", fontSize: "11px", fontWeight: "600",
        color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em",
      }}>
        {title}
      </p>
      <div style={{ display: "grid", gap: "8px" }}>
        {tickets
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((ticket) => {
            const isSelected = selected?._id === ticket._id;
            return (
              <div
                key={ticket._id}
                onClick={() => onSelect(isSelected ? null : ticket)}
                style={{
                  background: isSelected ? "rgba(37,99,235,0.08)" : "rgba(255,255,255,0.04)",
                  border: isSelected
                    ? "1px solid rgba(37,99,235,0.25)"
                    : "1px solid rgba(255,255,255,0.07)",
                  borderLeft: `3px solid ${PRIORITY_BORDER[ticket.priority] || "#64748b"}`,
                  borderRadius: "0 12px 12px 0",
                  padding: "14px 16px",
                  cursor: "pointer",
                  opacity: dimmed && !isSelected ? 0.6 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>
                      {ticket.title}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      {getCategoryLabel(ticket.category)} ·{" "}
                      {new Date(ticket.createdAt).toLocaleDateString("es-DO", { day: "numeric", month: "short" })}
                      {ticket.communications?.length > 0 && (
                        <span style={{ marginLeft: "6px", color: "#4ade80" }}>
                          · {ticket.communications.length} respuesta{ticket.communications.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "flex-start" }}>
                    <PriorityBadge priority={ticket.priority} />
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                </div>

                {/* Preview de la descripción */}
                {!isSelected && (
                  <p style={{
                    margin: "8px 0 0", fontSize: "12px", color: "#64748b",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    maxWidth: "90%",
                  }}>
                    {ticket.description}
                  </p>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ─── TicketDetail — panel inline con timeline ─────────────────────────────────
function TicketDetail({ ticket, onClose }) {
  return (
    <div style={{
      marginTop: "20px",
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "14px", overflow: "hidden",
      animation: "fadeIn 0.2s ease",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header del detalle */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: "12px", padding: "18px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
            <PriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
          </div>
          <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#f1f5f9" }}>
            {ticket.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px", padding: "6px 12px",
            color: "#94a3b8", cursor: "pointer", fontSize: "12px", flexShrink: 0,
          }}
        >
          Cerrar ✕
        </button>
      </div>

      {/* Descripción */}
      <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Descripción
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
          {ticket.description}
        </p>

        {ticket.notes && (
          <div style={{
            marginTop: "12px", padding: "10px 14px",
            background: "rgba(251,191,36,0.07)",
            border: "1px solid rgba(251,191,36,0.15)",
            borderRadius: "8px",
          }}>
            <p style={{ margin: "0 0 3px", fontSize: "11px", color: "#fbbf24", fontWeight: "600" }}>
              💬 Nota del propietario
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#fde68a" }}>{ticket.notes}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
          <MetaItem label="Categoría" value={getCategoryLabel(ticket.category)} />
          <MetaItem label="Fecha" value={new Date(ticket.createdAt).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })} />
          <MetaItem label="Origen" value={ticket.source === "whatsapp" ? "💬 WhatsApp" : "🖥 Dashboard"} />
        </div>
      </div>

      {/* Timeline de comunicaciones */}
      <div style={{ padding: "18px 20px" }}>
        <p style={{ margin: "0 0 14px", fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Historial de comunicaciones {ticket.communications?.length > 0 && `· ${ticket.communications.length}`}
        </p>

        {!ticket.communications?.length ? (
          <p style={{ margin: 0, fontSize: "13px", color: "#475569", fontStyle: "italic" }}>
            Aún no hay mensajes en este ticket.
          </p>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Línea vertical del timeline */}
            <div style={{
              position: "absolute", left: "15px", top: "8px",
              bottom: "8px", width: "1px",
              background: "rgba(255,255,255,0.08)",
            }} />

            <div style={{ display: "grid", gap: "14px" }}>
              {[...ticket.communications]
                .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
                .map((comm, i) => {
                  const style = CHANNEL_STYLES[comm.channel] || CHANNEL_STYLES.email;
                  return (
                    <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      {/* Punto del timeline */}
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "50%",
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", flexShrink: 0, zIndex: 1,
                      }}>
                        {style.icon}
                      </div>

                      {/* Contenido */}
                      <div style={{
                        flex: 1, padding: "10px 14px",
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        borderRadius: "10px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", flexWrap: "wrap", gap: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: style.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {comm.channel === "email" ? "Email" : "WhatsApp"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#475569" }}>
                            {new Date(comm.sentAt).toLocaleString("es-DO", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
                          {comm.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers y micro-componentes ─────────────────────────────────────────────

function MetaItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "#475569", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{value}</div>
    </div>
  );
}

function getCategoryLabel(cat) {
  const map = {
    plumbing: "🔧 Plomería", electrical: "⚡ Eléctrico",
    hvac: "❄️ Climatización", structural: "🏗️ Estructural", general: "📦 General",
  };
  return map[cat] || cat;
}

const labelSt = {
  display: "block", fontSize: "12px", color: "#64748b",
  fontWeight: "500", letterSpacing: "0.03em", marginBottom: "6px",
};

const inputSt = {
  width: "100%", borderRadius: "10px", padding: "10px 13px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "#f1f5f9", fontSize: "13px", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box",
};