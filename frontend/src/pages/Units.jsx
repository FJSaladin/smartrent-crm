import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useToast, ToastContainer } from "../components/ui/Toast";
import { UnitStatusBadge } from "../components/ui/Badge";
import { EmptyUnits, LoadingRows } from "../components/ui/EmptyState";
import {
  pageCard, formInput, formField, btn, labelStyle,
  sectionHeader, sectionTitle, twoColLayout,
  pageTitle, pageSubtitle, InfoRow, CountBadge,
} from "../components/ui/formStyles";

const UNIT_BORDER = {
  occupied: "#22c55e",
  vacant:   "#f59e0b",
  inactive: "#64748b",
};

export default function Units() {
  const [properties, setProperties]           = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [units, setUnits]                     = useState([]);
  const [editingId, setEditingId]             = useState(null);

  const [unitNumber, setUnitNumber] = useState("");
  const [bedrooms, setBedrooms]     = useState("");
  const [bathrooms, setBathrooms]   = useState("");
  const [rent, setRent]             = useState("");
  const [status, setStatus]         = useState("vacant");
  const [notes, setNotes]           = useState("");

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingUnits, setLoadingUnits]           = useState(false);
  const [saving, setSaving]                       = useState(false);

  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => { loadProperties(); }, []);

  useEffect(() => {
    if (selectedPropertyId) loadUnits(selectedPropertyId);
    else setUnits([]);
  }, [selectedPropertyId]);

  async function loadProperties() {
    try {
      const data = await apiFetch("/api/properties");
      const list = data.properties || [];
      setProperties(list);
      if (list.length > 0) setSelectedPropertyId(list[0]._id);
    } catch (err) {
      showToast(err.message || "No se pudieron cargar las propiedades", "error");
    } finally {
      setLoadingProperties(false);
    }
  }

  async function loadUnits(propertyId) {
    setLoadingUnits(true);
    try {
      const data = await apiFetch(`/api/properties/${propertyId}/units`);
      setUnits(data.units || []);
    } catch (err) {
      showToast(err.message || "No se pudieron cargar las unidades", "error");
    } finally {
      setLoadingUnits(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setUnitNumber(""); setBedrooms(""); setBathrooms("");
    setRent(""); setStatus("vacant"); setNotes("");
  }

  function startEdit(u) {
    setEditingId(u._id);
    setUnitNumber(u.unitNumber || "");
    setBedrooms(u.bedrooms ?? ""); setBathrooms(u.bathrooms ?? "");
    setRent(u.rent ?? ""); setStatus(u.status || "vacant");
    setNotes(u.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedPropertyId) { showToast("Selecciona una propiedad", "error"); return; }
    if (!unitNumber.trim()) { showToast("El número de unidad es obligatorio", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        unitNumber: unitNumber.trim(),
        bedrooms: Number(bedrooms || 0),
        bathrooms: Number(bathrooms || 0),
        rent: Number(rent || 0),
        status, notes: notes.trim(),
      };
      if (editingId) {
        const data = await apiFetch(`/api/units/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        setUnits((prev) => prev.map((u) => (u._id === editingId ? data.unit : u)));
        showToast("Unidad actualizada correctamente", "success");
      } else {
        const data = await apiFetch(`/api/properties/${selectedPropertyId}/units`, { method: "POST", body: JSON.stringify(payload) });
        setUnits((prev) => [data.unit, ...prev]);
        showToast("Unidad creada correctamente", "success");
      }
      resetForm();
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta unidad?")) return;
    try {
      await apiFetch(`/api/units/${id}`, { method: "DELETE" });
      setUnits((prev) => prev.filter((u) => u._id !== id));
      if (editingId === id) resetForm();
      showToast("Unidad eliminada", "info");
    } catch (err) {
      showToast(err.message || "No se pudo eliminar", "error");
    }
  }

  const selectedProp = properties.find((p) => p._id === selectedPropertyId);
  const occupiedCount = units.filter((u) => u.status === "occupied").length;

  return (
    <div>
      <h1 style={pageTitle}>Unidades</h1>
      <p style={pageSubtitle}>Gestiona las unidades dentro de cada propiedad.</p>

      {/* Selector de propiedad */}
      <div style={{ ...pageCard, marginTop: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ ...labelStyle, display: "block", marginBottom: "6px" }}>
              Propiedad activa
            </label>
            <select
              style={{ ...formInput, margin: 0 }}
              value={selectedPropertyId}
              onChange={(e) => { resetForm(); setSelectedPropertyId(e.target.value); }}
              disabled={loadingProperties || properties.length === 0}
            >
              {properties.length === 0
                ? <option value="">No hay propiedades disponibles</option>
                : properties.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} — {p.address}</option>
                ))
              }
            </select>
          </div>
          {selectedProp && units.length > 0 && (
            <div style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
              <Stat label="Total" value={units.length} />
              <Stat label="Ocupadas" value={occupiedCount} color="#22c55e" />
              <Stat label="Vacantes" value={units.length - occupiedCount} color="#f59e0b" />
            </div>
          )}
        </div>
      </div>

      <div style={twoColLayout}>
        {/* ── Formulario ── */}
        <div style={pageCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>{editingId ? "Editar unidad" : "Nueva unidad"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ ...btn.neutral, padding: "7px 12px", fontSize: "13px" }}>
                Cancelar
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={formField}>
              <label style={labelStyle}>Número de unidad *</label>
              <input style={formInput} type="text" placeholder="Ej. 3B, 101, PH" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={formField}>
                <label style={labelStyle}>Habitaciones</label>
                <input style={formInput} type="number" min="0" placeholder="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
              </div>
              <div style={formField}>
                <label style={labelStyle}>Baños</label>
                <input style={formInput} type="number" min="0" placeholder="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
              </div>
            </div>
            <div style={formField}>
              <label style={labelStyle}>Renta mensual (RD$)</label>
              <input style={formInput} type="number" min="0" placeholder="0" value={rent} onChange={(e) => setRent(e.target.value)} />
            </div>
            <div style={formField}>
              <label style={labelStyle}>Estado</label>
              <select style={formInput} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="vacant">Vacante</option>
                <option value="occupied">Ocupada</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>
            <div style={formField}>
              <label style={labelStyle}>Notas (opcional)</label>
              <textarea style={{ ...formInput, minHeight: "80px", resize: "vertical" }} placeholder="Observaciones..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button type="submit" style={{ ...btn.primary, width: "100%" }} disabled={saving}>
              {saving ? (editingId ? "Guardando..." : "Creando...") : (editingId ? "Guardar cambios" : "Crear unidad")}
            </button>
          </form>
        </div>

        {/* ── Listado ── */}
        <div style={pageCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>Unidades — {selectedProp?.name || "..."}</h2>
            <CountBadge count={units.length} />
          </div>

          {!selectedPropertyId ? (
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>Selecciona una propiedad para ver sus unidades.</p>
          ) : loadingUnits ? (
            <LoadingRows count={3} />
          ) : units.length === 0 ? (
            <EmptyUnits />
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {units.map((u) => (
                <div
                  key={u._id}
                  style={{
                    background: editingId === u._id ? "rgba(37,99,235,0.07)" : "rgba(255,255,255,0.04)",
                    border: editingId === u._id ? "1px solid rgba(37,99,235,0.25)" : "1px solid rgba(255,255,255,0.07)",
                    borderLeft: `3px solid ${editingId === u._id ? "#2563eb" : (UNIT_BORDER[u.status] || "#64748b")}`,
                    borderRadius: "0 12px 12px 0",
                    padding: "14px 16px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>Unidad {u.unitNumber}</span>
                        <UnitStatusBadge status={u.status} />
                      </div>
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        <InfoRow label="Hab" value={u.bedrooms} />
                        <InfoRow label="Baños" value={u.bathrooms} />
                        <InfoRow label="Renta" value={`$${u.rent?.toLocaleString()}`} />
                      </div>
                      {u.notes && <InfoRow label="Notas" value={u.notes} />}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button onClick={() => startEdit(u)} style={{ ...btn.warning, padding: "7px 12px", fontSize: "12px" }}>Editar</button>
                      <button onClick={() => handleDelete(u._id)} style={{ ...btn.danger, padding: "7px 12px", fontSize: "12px" }}>Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

function Stat({ label, value, color = "#94a3b8" }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "20px", fontWeight: "700", color }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{label}</div>
    </div>
  );
}