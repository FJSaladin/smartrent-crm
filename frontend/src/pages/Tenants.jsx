import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useToast, ToastContainer } from "../components/ui/Toast";
import { TenantStatusBadge } from "../components/ui/Badge";
import { EmptyTenants, LoadingRows } from "../components/ui/EmptyState";
import {
  pageCard, formInput, formField, btn, labelStyle,
  sectionHeader, sectionTitle, twoColLayout,
  pageTitle, pageSubtitle, InfoRow, CountBadge,
} from "../components/ui/FormStyles.jsx";

export default function Tenants() {
  const [tenants, setTenants]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [editingId, setEditingId]   = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [status, setStatus]     = useState("active");
  const [notes, setNotes]       = useState("");

  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => { loadTenants(); }, []);

  async function loadTenants() {
    try {
      const data = await apiFetch("/api/tenants");
      setTenants(data.tenants || []);
    } catch (err) {
      showToast(err.message || "No se pudieron cargar los inquilinos", "error");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setFullName(""); setEmail(""); setPhone("");
    setStatus("active"); setNotes("");
  }

  function startEdit(t) {
    setEditingId(t._id);
    setFullName(t.fullName || ""); setEmail(t.email || "");
    setPhone(t.phone || ""); setStatus(t.status || "active");
    setNotes(t.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim()) { showToast("El nombre es obligatorio", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        status, notes: notes.trim(),
      };
      if (editingId) {
        const data = await apiFetch(`/api/tenants/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        setTenants((prev) => prev.map((t) => (t._id === editingId ? data.tenant : t)));
        showToast("Inquilino actualizado correctamente", "success");
      } else {
        const data = await apiFetch("/api/tenants", { method: "POST", body: JSON.stringify(payload) });
        setTenants((prev) => [data.tenant, ...prev]);
        showToast("Inquilino creado correctamente", "success");
      }
      resetForm();
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este inquilino?")) return;
    try {
      await apiFetch(`/api/tenants/${id}`, { method: "DELETE" });
      setTenants((prev) => prev.filter((t) => t._id !== id));
      if (editingId === id) resetForm();
      showToast("Inquilino eliminado", "info");
    } catch (err) {
      showToast(err.message || "No se pudo eliminar", "error");
    }
  }

  // Iniciales para el avatar
  function getInitials(name) {
    return name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  }

  return (
    <div>
      <h1 style={pageTitle}>Inquilinos</h1>
      <p style={pageSubtitle}>Gestiona los inquilinos registrados en SmartRent.</p>

      <div style={twoColLayout}>
        {/* ── Formulario ── */}
        <div style={pageCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>{editingId ? "Editar inquilino" : "Nuevo inquilino"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ ...btn.neutral, padding: "7px 12px", fontSize: "13px" }}>
                Cancelar
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={formField}>
              <label style={labelStyle}>Nombre completo *</label>
              <input style={formInput} type="text" placeholder="Ej. María García" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div style={formField}>
              <label style={labelStyle}>Correo electrónico</label>
              <input style={formInput} type="email" placeholder="tenant@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={formField}>
              <label style={labelStyle}>Teléfono</label>
              <input style={formInput} type="tel" placeholder="809-000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div style={formField}>
              <label style={labelStyle}>Estado</label>
              <select style={formInput} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div style={formField}>
              <label style={labelStyle}>Notas (opcional)</label>
              <textarea style={{ ...formInput, minHeight: "80px", resize: "vertical" }} placeholder="Observaciones..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button type="submit" style={{ ...btn.primary, width: "100%" }} disabled={saving}>
              {saving ? (editingId ? "Guardando..." : "Creando...") : (editingId ? "Guardar cambios" : "Crear inquilino")}
            </button>
          </form>
        </div>

        {/* ── Listado ── */}
        <div style={pageCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>Listado de inquilinos</h2>
            <CountBadge count={tenants.length} />
          </div>

          {loading ? (
            <LoadingRows count={3} />
          ) : tenants.length === 0 ? (
            <EmptyTenants />
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {tenants.map((t) => (
                <div
                  key={t._id}
                  style={{
                    background: editingId === t._id ? "rgba(37,99,235,0.07)" : "rgba(255,255,255,0.04)",
                    border: editingId === t._id ? "1px solid rgba(37,99,235,0.25)" : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, minWidth: 0 }}>
                      {/* Avatar con iniciales */}
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: "rgba(37,99,235,0.2)",
                        border: "1px solid rgba(37,99,235,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", fontWeight: "700", color: "#60a5fa",
                        flexShrink: 0,
                      }}>
                        {getInitials(t.fullName)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>{t.fullName}</span>
                          <TenantStatusBadge status={t.status} />
                        </div>
                        {t.email && <InfoRow label="Email" value={t.email} />}
                        {t.phone && <InfoRow label="Tel" value={t.phone} />}
                        {t.notes && <InfoRow label="Notas" value={t.notes} />}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button onClick={() => startEdit(t)} style={{ ...btn.warning, padding: "7px 12px", fontSize: "12px" }}>Editar</button>
                      <button onClick={() => handleDelete(t._id)} style={{ ...btn.danger, padding: "7px 12px", fontSize: "12px" }}>Eliminar</button>
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