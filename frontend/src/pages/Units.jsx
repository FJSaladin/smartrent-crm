import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function Units() {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [units, setUnits] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [unitNumber, setUnitNumber] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [rent, setRent] = useState("");
  const [status, setStatus] = useState("vacant");
  const [notes, setNotes] = useState("");

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) loadUnits(selectedPropertyId);
    else setUnits([]);
  }, [selectedPropertyId]);

  async function loadProperties() {
    try {
      setError("");
      const data = await apiFetch("/api/properties");
      const list = data.properties || [];
      setProperties(list);

      if (list.length > 0) {
        setSelectedPropertyId(list[0]._id);
      }
    } catch (err) {
      setError(err.message || "No se pudieron cargar las propiedades");
    } finally {
      setLoadingProperties(false);
    }
  }

  async function loadUnits(propertyId) {
    try {
      setLoadingUnits(true);
      setError("");
      const data = await apiFetch(`/api/properties/${propertyId}/units`);
      setUnits(data.units || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las unidades");
    } finally {
      setLoadingUnits(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setUnitNumber("");
    setBedrooms("");
    setBathrooms("");
    setRent("");
    setStatus("vacant");
    setNotes("");
  }

  function startEdit(unit) {
    setEditingId(unit._id);
    setUnitNumber(unit.unitNumber || "");
    setBedrooms(unit.bedrooms ?? "");
    setBathrooms(unit.bathrooms ?? "");
    setRent(unit.rent ?? "");
    setStatus(unit.status || "vacant");
    setNotes(unit.notes || "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!selectedPropertyId) {
      setError("Debes seleccionar una propiedad");
      return;
    }

    const cleanUnitNumber = unitNumber.trim();
    const cleanNotes = notes.trim();

    if (!cleanUnitNumber) {
      setError("Debes completar el número de unidad");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const data = await apiFetch(`/api/units/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            unitNumber: cleanUnitNumber,
            bedrooms: Number(bedrooms || 0),
            bathrooms: Number(bathrooms || 0),
            rent: Number(rent || 0),
            status,
            notes: cleanNotes,
          }),
        });

        setUnits((prev) =>
          prev.map((u) => (u._id === editingId ? data.unit : u))
        );
      } else {
        const data = await apiFetch(`/api/properties/${selectedPropertyId}/units`, {
          method: "POST",
          body: JSON.stringify({
            unitNumber: cleanUnitNumber,
            bedrooms: Number(bedrooms || 0),
            bathrooms: Number(bathrooms || 0),
            rent: Number(rent || 0),
            status,
            notes: cleanNotes,
          }),
        });

        setUnits((prev) => [data.unit, ...prev]);
      }

      resetForm();
    } catch (err) {
      setError(
        err.message ||
          (editingId
            ? "No se pudo actualizar la unidad"
            : "No se pudo crear la unidad")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUnit(id) {
    const confirmed = window.confirm("¿Seguro que deseas eliminar esta unidad?");
    if (!confirmed) return;

    try {
      await apiFetch(`/api/units/${id}`, {
        method: "DELETE",
      });

      setUnits((prev) => prev.filter((u) => u._id !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "No se pudo eliminar la unidad");
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Unidades</h1>
      <p style={{ color: "#cbd5e1" }}>
        Gestiona las unidades/apartamentos dentro de cada propiedad.
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

      <div style={topCard}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          Selecciona una propiedad
        </label>
        <select
          style={inputStyle}
          value={selectedPropertyId}
          onChange={(e) => {
            resetForm();
            setSelectedPropertyId(e.target.value);
          }}
          disabled={loadingProperties || properties.length === 0}
        >
          {properties.length === 0 ? (
            <option value="">No hay propiedades disponibles</option>
          ) : (
            properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.name} - {property.address}
              </option>
            ))
          )}
        </select>
      </div>

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
              {editingId ? "Editar unidad" : "Nueva unidad"}
            </h2>

            {editingId && (
              <button type="button" onClick={resetForm} style={secondaryButton}>
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label>Número de unidad</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Ej. 3B"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label>Habitaciones</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label>Baños</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label>Renta</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label>Estado</label>
              <select
                style={inputStyle}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="vacant">Vacante</option>
                <option value="occupied">Ocupada</option>
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
                : "Crear unidad"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Listado de unidades</h2>

          {!selectedPropertyId ? (
            <p style={{ color: "#cbd5e1" }}>
              Selecciona una propiedad para ver sus unidades.
            </p>
          ) : loadingUnits ? (
            <p>Cargando unidades...</p>
          ) : units.length === 0 ? (
            <p style={{ color: "#cbd5e1" }}>
              Aún no hay unidades registradas para esta propiedad.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {units.map((unit) => (
                <div
                  key={unit._id}
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
                      <h3 style={{ margin: "0 0 8px" }}>Unidad {unit.unitNumber}</h3>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Habitaciones:</strong> {unit.bedrooms}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Baños:</strong> {unit.bathrooms}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Renta:</strong> ${unit.rent}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Estado:</strong> {unit.status}
                      </p>
                      <p style={{ margin: 0, color: "#cbd5e1" }}>
                        <strong>Notas:</strong> {unit.notes || "Sin notas"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button onClick={() => startEdit(unit)} style={editButton}>
                        Editar
                      </button>

                      <button
                        onClick={() => handleDeleteUnit(unit._id)}
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

const topCard = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
};

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
  width: "100%",
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