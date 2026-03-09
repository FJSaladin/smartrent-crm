import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadProperties() {
    try {
      setError("");
      const data = await apiFetch("/api/properties");
      setProperties(data.properties || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las propiedades");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setAddress("");
    setStatus("active");
    setNotes("");
  }

  function startEdit(property) {
    setEditingId(property._id);
    setName(property.name || "");
    setAddress(property.address || "");
    setStatus(property.status || "active");
    setNotes(property.notes || "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanAddress = address.trim();
    const cleanNotes = notes.trim();

    if (!cleanName || !cleanAddress) {
      setError("Debes completar nombre y dirección");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const data = await apiFetch(`/api/properties/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: cleanName,
            address: cleanAddress,
            status,
            notes: cleanNotes,
          }),
        });

        setProperties((prev) =>
          prev.map((p) => (p._id === editingId ? data.property : p))
        );
      } else {
        const data = await apiFetch("/api/properties", {
          method: "POST",
          body: JSON.stringify({
            name: cleanName,
            address: cleanAddress,
            status,
            notes: cleanNotes,
          }),
        });

        setProperties((prev) => [data.property, ...prev]);
      }

      resetForm();
    } catch (err) {
      setError(
        err.message ||
          (editingId
            ? "No se pudo actualizar la propiedad"
            : "No se pudo crear la propiedad")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProperty(id) {
    const confirmed = window.confirm("¿Seguro que deseas eliminar esta propiedad?");
    if (!confirmed) return;

    try {
      await apiFetch(`/api/properties/${id}`, {
        method: "DELETE",
      });

      setProperties((prev) => prev.filter((p) => p._id !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "No se pudo eliminar la propiedad");
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Propiedades</h1>
      <p style={{ color: "#cbd5e1" }}>
        Gestiona las propiedades registradas en SmartRent.
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
              {editingId ? "Editar propiedad" : "Nueva propiedad"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={secondaryButton}
              >
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label>Nombre</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Ej. Torre Norte"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label>Dirección</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Ej. Santo Domingo, RD"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label>Estado</label>
              <select
                style={inputStyle}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
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
                : "Crear propiedad"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Listado de propiedades</h2>

          {loading ? (
            <p>Cargando propiedades...</p>
          ) : properties.length === 0 ? (
            <p style={{ color: "#cbd5e1" }}>Aún no hay propiedades registradas.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {properties.map((property) => (
                <div
                  key={property._id}
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
                      <h3 style={{ margin: "0 0 8px" }}>{property.name}</h3>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Dirección:</strong> {property.address}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Estado:</strong> {property.status}
                      </p>
                      <p style={{ margin: 0, color: "#cbd5e1" }}>
                        <strong>Notas:</strong> {property.notes || "Sin notas"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => startEdit(property)}
                        style={editButton}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDeleteProperty(property._id)}
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