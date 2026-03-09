import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTenants() {
    try {
      setError("");
      const data = await apiFetch("/api/tenants");
      setTenants(data.tenants || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los tenants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  function resetForm() {
    setEditingId(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setStatus("active");
    setNotes("");
  }

  function startEdit(tenant) {
    setEditingId(tenant._id);
    setFullName(tenant.fullName || "");
    setEmail(tenant.email || "");
    setPhone(tenant.phone || "");
    setStatus(tenant.status || "active");
    setNotes(tenant.notes || "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanNotes = notes.trim();

    if (!cleanFullName) {
      setError("Debes completar el nombre del tenant");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const data = await apiFetch(`/api/tenants/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            fullName: cleanFullName,
            email: cleanEmail,
            phone: cleanPhone,
            status,
            notes: cleanNotes,
          }),
        });

        setTenants((prev) =>
          prev.map((t) => (t._id === editingId ? data.tenant : t))
        );
      } else {
        const data = await apiFetch("/api/tenants", {
          method: "POST",
          body: JSON.stringify({
            fullName: cleanFullName,
            email: cleanEmail,
            phone: cleanPhone,
            status,
            notes: cleanNotes,
          }),
        });

        setTenants((prev) => [data.tenant, ...prev]);
      }

      resetForm();
    } catch (err) {
      setError(
        err.message ||
          (editingId
            ? "No se pudo actualizar el tenant"
            : "No se pudo crear el tenant")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTenant(id) {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este tenant?");
    if (!confirmed) return;

    try {
      await apiFetch(`/api/tenants/${id}`, {
        method: "DELETE",
      });

      setTenants((prev) => prev.filter((t) => t._id !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "No se pudo eliminar el tenant");
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Tenants</h1>
      <p style={{ color: "#cbd5e1" }}>
        Gestiona los inquilinos registrados en SmartRent.
      </p>

      {error && (
        <div
          style={{
            background: "#7f1d1d",
            border: "1px solid #ef4444",
            padding: "12px 14px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "24px",
          marginTop: "24px",
        }}
      >
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "10px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              {editingId ? "Editar tenant" : "Nuevo tenant"}
            </h2>

            {editingId && (
              <button type="button" onClick={resetForm} style={secondaryButton}>
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label>Nombre completo</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Ej. María García"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label>Correo electrónico</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="tenant@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label>Teléfono</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="809-000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label>Estado</label>
              <select
                style={inputStyle}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div style={fieldStyle}>
              <label>Notas</label>
              <textarea
                style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
                placeholder="Observaciones opcionales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" style={primaryButton} disabled={saving}>
              {saving
                ? editingId
                  ? "Guardando..."
                  : "Creando..."
                : editingId
                ? "Guardar cambios"
                : "Crear tenant"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Listado de tenants</h2>

          {loading ? (
            <p>Cargando tenants...</p>
          ) : tenants.length === 0 ? (
            <p style={{ color: "#cbd5e1" }}>Aún no hay tenants registrados.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {tenants.map((tenant) => (
                <div
                  key={tenant._id}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 8px" }}>{tenant.fullName}</h3>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Email:</strong> {tenant.email || "Sin email"}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Teléfono:</strong> {tenant.phone || "Sin teléfono"}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Estado:</strong> {tenant.status}
                      </p>
                      <p style={{ margin: 0, color: "#cbd5e1" }}>
                        <strong>Notas:</strong> {tenant.notes || "Sin notas"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => startEdit(tenant)}
                        style={editButton}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDeleteTenant(tenant._id)}
                        style={dangerButton}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginBottom: "14px",
};

const inputStyle = {
  borderRadius: "10px",
  padding: "12px 14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  outline: "none",
};

const primaryButton = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
};

const secondaryButton = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#475569",
  color: "white",
  fontWeight: "bold",
};

const editButton = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#f59e0b",
  color: "white",
  fontWeight: "bold",
};

const dangerButton = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#ef4444",
  color: "white",
  fontWeight: "bold",
};