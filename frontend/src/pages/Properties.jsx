import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useToast, ToastContainer } from "../components/ui/Toast";
import { PropertyStatusBadge } from "../components/ui/Badge";
import { EmptyProperties, LoadingRows } from "../components/ui/EmptyState";
import {
  pageCard, formInput, formField, btn, labelStyle,
  sectionHeader, sectionTitle, twoColLayout,
  pageTitle, pageSubtitle, InfoRow, CountBadge,
} from "../components/ui/formStyles";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [editingId, setEditingId]   = useState(null);

  const [name, setName]     = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus]   = useState("active");
  const [notes, setNotes]     = useState("");

  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => { loadProperties(); }, []);

  async function loadProperties() {
    try {
      const data = await apiFetch("/api/properties");
      setProperties(data.properties || []);
    } catch (err) {
      showToast(err.message || "No se pudieron cargar las propiedades", "error");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName(""); setAddress(""); setStatus("active"); setNotes("");
  }

  function startEdit(p) {
    setEditingId(p._id);
    setName(p.name || ""); setAddress(p.address || "");
    setStatus(p.status || "active"); setNotes(p.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      showToast("Nombre y dirección son obligatorios", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), address: address.trim(), status, notes: notes.trim() };
      if (editingId) {
        const data = await apiFetch(`/api/properties/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        setProperties((prev) => prev.map((p) => (p._id === editingId ? data.property : p)));
        showToast("Propiedad actualizada correctamente", "success");
      } else {
        const data = await apiFetch("/api/properties", { method: "POST", body: JSON.stringify(payload) });
        setProperties((prev) => [data.property, ...prev]);
        showToast("Propiedad creada correctamente", "success");
      }
      resetForm();
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer.")) return;
    try {
      await apiFetch(`/api/properties/${id}`, { method: "DELETE" });
      setProperties((prev) => prev.filter((p) => p._id !== id));
      if (editingId === id) resetForm();
      showToast("Propiedad eliminada", "info");
    } catch (err) {
      showToast(err.message || "No se pudo eliminar", "error");
    }
  }

  return (
    <div>
      <h1 style={pageTitle}>Propiedades</h1>
      <p style={pageSubtitle}>Gestiona las propiedades registradas en SmartRent.</p>

      <div style={twoColLayout}>
        {/* ── Formulario ── */}
        <div style={pageCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>{editingId ? "Editar propiedad" : "Nueva propiedad"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ ...btn.neutral, padding: "7px 12px", fontSize: "13px" }}>
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={formField}>
              <label style={labelStyle}>Nombre *</label>
              <input style={formInput} type="text" placeholder="Ej. Torre Norte" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={formField}>
              <label style={labelStyle}>Dirección *</label>
              <input style={formInput} type="text" placeholder="Ej. Calle El Conde, Santo Domingo" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div style={formField}>
              <label style={labelStyle}>Estado</label>
              <select style={formInput} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>
            <div style={formField}>
              <label style={labelStyle}>Notas (opcional)</label>
              <textarea style={{ ...formInput, minHeight: "88px", resize: "vertical" }} placeholder="Observaciones..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button type="submit" style={{ ...btn.primary, width: "100%" }} disabled={saving}>
              {saving ? (editingId ? "Guardando..." : "Creando...") : (editingId ? "Guardar cambios" : "Crear propiedad")}
            </button>
          </form>
        </div>

        {/* ── Listado ── */}
        <div style={pageCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>Listado de propiedades</h2>
            <CountBadge count={properties.length} />
          </div>

          {loading ? (
            <LoadingRows count={3} />
          ) : properties.length === 0 ? (
            <EmptyProperties />
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {properties.map((p) => (
                <div
                  key={p._id}
                  style={{
                    background: editingId === p._id ? "rgba(37,99,235,0.07)" : "rgba(255,255,255,0.04)",
                    border: editingId === p._id ? "1px solid rgba(37,99,235,0.25)" : "1px solid rgba(255,255,255,0.07)",
                    borderLeft: `3px solid ${editingId === p._id ? "#2563eb" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: "0 12px 12px 0",
                    padding: "14px 16px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>{p.name}</span>
                        <PropertyStatusBadge status={p.status} />
                      </div>
                      <InfoRow label="Dirección" value={p.address} />
                      {p.notes && <InfoRow label="Notas" value={p.notes} />}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button onClick={() => startEdit(p)} style={{ ...btn.warning, padding: "7px 12px", fontSize: "12px" }}>Editar</button>
                      <button onClick={() => handleDelete(p._id)} style={{ ...btn.danger, padding: "7px 12px", fontSize: "12px" }}>Eliminar</button>
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