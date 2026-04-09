import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";

const PRIORITY_ORDER = {
  high: 1,
  medium: 2,
  low: 3,
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const [tenantFilter, setTenantFilter] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      setError("");
      const data = await apiFetch("/api/tickets");
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los tickets");
    } finally {
      setLoading(false);
    }
  }

  const tenants = useMemo(() => {
    const map = new Map();
    tickets.forEach((ticket) => {
      if (ticket.tenantId?._id) {
        map.set(ticket.tenantId._id, ticket.tenantId.fullName || "Tenant");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tickets]);

  const properties = useMemo(() => {
    const map = new Map();
    tickets.forEach((ticket) => {
      if (ticket.propertyId?._id) {
        map.set(ticket.propertyId._id, ticket.propertyId.name || "Property");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const list = tickets.filter((ticket) => {
      const tenantOk = !tenantFilter || ticket.tenantId?._id === tenantFilter;
      const propertyOk = !propertyFilter || ticket.propertyId?._id === propertyFilter;
      return tenantOk && propertyOk;
    });

    return list.sort((a, b) => {
      const priorityDiff =
        (PRIORITY_ORDER[a.priority] || 99) - (PRIORITY_ORDER[b.priority] || 99);

      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [tickets, tenantFilter, propertyFilter]);

  async function updateTicketField(ticketId, updates) {
    try {
      setSavingId(ticketId);

      const data = await apiFetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      setTickets((prev) =>
        prev.map((ticket) => (ticket._id === ticketId ? data.ticket : ticket))
      );

      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(data.ticket);
      }
    } catch (err) {
      setError(err.message || "No se pudo actualizar el ticket");
    } finally {
      setSavingId("");
    }
  }

  async function handleSendEmail(ticketId) {
    if (!replyMessage.trim()) {
      setError("Debes escribir un mensaje antes de enviar");
      return;
    }

    try {
      setSendingReply(true);

      const data = await apiFetch(`/api/tickets/${ticketId}/reply-email`, {
        method: "POST",
        body: JSON.stringify({
          message: replyMessage.trim(),
        }),
      });

      if (data.ticket) {
        setTickets((prev) =>
          prev.map((ticket) => (ticket._id === ticketId ? data.ticket : ticket))
        );
        setSelectedTicket(data.ticket);
      }

      setReplyMessage("");
      alert("Correo enviado correctamente");
    } catch (err) {
      setError(err.message || "No se pudo enviar el correo");
    } finally {
      setSendingReply(false);
    }
  }

  async function handleNotifyWhatsApp(ticketId) {
    if (!replyMessage.trim()) {
      setError("Debes escribir un mensaje antes de notificar");
      return;
    }

    try {
      setSendingReply(true);

      const data = await apiFetch(`/api/tickets/${ticketId}/notify-whatsapp`, {
        method: "POST",
        body: JSON.stringify({
          message: replyMessage.trim(),
        }),
      });

      if (data.ticket) {
        setTickets((prev) =>
          prev.map((ticket) => (ticket._id === ticketId ? data.ticket : ticket))
        );
        setSelectedTicket(data.ticket);
      }

      setReplyMessage("");
      alert("Notificación de WhatsApp enviada correctamente");
    } catch (err) {
      setError(err.message || "No se pudo enviar la notificación por WhatsApp");
    } finally {
      setSendingReply(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Tickets</h1>
      <p style={{ color: "#cbd5e1" }}>
        Visualiza y administra los tickets de mantenimiento de tus propiedades.
      </p>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={filtersCard}>
        <div style={filterField}>
          <label>Filtrar por tenant</label>
          <select
            style={inputStyle}
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        <div style={filterField}>
          <label>Filtrar por property</label>
          <select
            style={inputStyle}
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
          >
            <option value="">Todas</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        {loading ? (
          <p>Cargando tickets...</p>
        ) : filteredTickets.length === 0 ? (
          <p style={{ color: "#cbd5e1" }}>No hay tickets para mostrar.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {filteredTickets.map((ticket) => (
              <div key={ticket._id} style={ticketCard}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <h3 style={{ margin: "0 0 8px" }}>{ticket.title}</h3>
                    <p style={mutedP}>
                      <strong>Tenant:</strong> {ticket.tenantId?.fullName || "N/D"}
                    </p>
                    <p style={mutedP}>
                      <strong>Property:</strong> {ticket.propertyId?.name || "N/D"}
                    </p>
                    <p style={mutedP}>
                      <strong>Unit:</strong> {ticket.unitId?.unitNumber || "N/D"}
                    </p>
                    <p style={mutedP}>
                      <strong>Descripción:</strong> {ticket.description}
                    </p>
                    <p style={mutedP}>
                      <strong>Fecha:</strong> {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                    <p style={mutedP}>
                      <strong>Origen:</strong> {ticket.source}
                    </p>
                  </div>

                  <div style={{ minWidth: "220px", display: "grid", gap: "10px" }}>
                    <div>
                      <label style={smallLabel}>Prioridad</label>
                      <select
                        style={inputStyle}
                        value={ticket.priority}
                        disabled={savingId === ticket._id}
                        onChange={(e) =>
                          updateTicketField(ticket._id, { priority: e.target.value })
                        }
                      >
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                      </select>
                    </div>

                    <div>
                      <label style={smallLabel}>Estado</label>
                      <select
                        style={inputStyle}
                        value={ticket.status}
                        disabled={savingId === ticket._id}
                        onChange={(e) =>
                          updateTicketField(ticket._id, { status: e.target.value })
                        }
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <button
                      style={primaryButton}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setReplyMessage("");
                      }}
                    >
                      Abrir ticket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <div style={overlayStyle} onClick={() => setSelectedTicket(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedTicket.title}</h2>
                <p style={{ ...mutedP, marginTop: "8px" }}>
                  <strong>Número:</strong> {selectedTicket._id}
                </p>
                <p style={mutedP}>
                  <strong>Estado:</strong> {selectedTicket.status}
                </p>
                <p style={mutedP}>
                  <strong>Prioridad:</strong> {selectedTicket.priority}
                </p>
              </div>

              <button style={closeButton} onClick={() => setSelectedTicket(null)}>
                Cerrar
              </button>
            </div>

            <div style={{ marginTop: "20px" }}>
              <p style={mutedP}>
                <strong>Tenant:</strong> {selectedTicket.tenantId?.fullName || "N/D"}
              </p>
              <p style={mutedP}>
                <strong>Email:</strong> {selectedTicket.tenantId?.email || "N/D"}
              </p>
              <p style={mutedP}>
                <strong>Teléfono:</strong> {selectedTicket.tenantId?.phone || "N/D"}
              </p>
              <p style={mutedP}>
                <strong>Property:</strong> {selectedTicket.propertyId?.name || "N/D"}
              </p>
              <p style={mutedP}>
                <strong>Descripción:</strong> {selectedTicket.description}
              </p>
              <p style={mutedP}>
                <strong>Notas:</strong> {selectedTicket.notes || "Sin notas"}
              </p>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "12px" }}>Historial de comunicaciones</h3>

              {!selectedTicket.communications || selectedTicket.communications.length === 0 ? (
                <p style={{ color: "#cbd5e1" }}>Aún no hay comunicaciones registradas.</p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {[...selectedTicket.communications]
                    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
                    .map((comm, index) => (
                      <div
                        key={index}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          padding: "14px",
                        }}
                      >
                        <p style={mutedP}>
                          <strong>Canal:</strong> {comm.channel}
                        </p>
                        <p style={mutedP}>
                          <strong>Fecha:</strong> {new Date(comm.sentAt).toLocaleString()}
                        </p>
                        <p style={{ margin: 0, color: "#cbd5e1" }}>
                          <strong>Mensaje:</strong> {comm.message}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={smallLabel}>Mensaje de respuesta</label>
              <textarea
                style={{ ...inputStyle, minHeight: "130px", resize: "vertical" }}
                placeholder="Escribe aquí el mensaje para el tenant..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
              <button
                style={primaryButton}
                disabled={sendingReply}
                onClick={() => handleSendEmail(selectedTicket._id)}
              >
                Enviar correo
              </button>

              <button
                style={whatsAppButton}
                disabled={sendingReply}
                onClick={() => handleNotifyWhatsApp(selectedTicket._id)}
              >
                Notificar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const filtersCard = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  padding: "20px",
};

const filterField = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const ticketCard = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
};

const inputStyle = {
  width: "100%",
  borderRadius: "10px",
  padding: "12px 14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  outline: "none",
};

const primaryButton = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
};

const whatsAppButton = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#22c55e",
  color: "white",
  fontWeight: "bold",
};

const closeButton = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#475569",
  color: "white",
  fontWeight: "bold",
  height: "fit-content",
};

const smallLabel = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  color: "#cbd5e1",
};

const mutedP = {
  margin: "0 0 8px",
  color: "#cbd5e1",
};

const errorStyle = {
  background: "#7f1d1d",
  border: "1px solid #ef4444",
  padding: "12px 14px",
  borderRadius: "10px",
  marginBottom: "20px",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalStyle = {
  width: "100%",
  maxWidth: "800px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "18px",
  padding: "24px",
  color: "white",
};