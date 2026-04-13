import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";
import { useToast, ToastContainer } from "../components/ui/Toast";
import { LeaseStatusBadge } from "../components/ui/Badge";
import { EmptyLeases, LoadingRows } from "../components/ui/EmptyState";
import {
  pageCard, formInput, formField, btn, labelStyle,
  sectionHeader, sectionTitle, twoColLayout,
  pageTitle, pageSubtitle, InfoRow, CountBadge,
} from "../components/ui/formStyles";

function fmtDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

function fmtMoney(n) {
  return `$${Number(n || 0).toLocaleString()}`;
}

export default function Leases() {
  const [leases, setLeases]       = useState([]);
  const [properties, setProperties] = useState([]);
  const [units, setUnits]         = useState([]);
  const [tenants, setTenants]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving]       = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId]         = useState("");
  const [tenantId, setTenantId]     = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [deposit, setDeposit]       = useState("");
  const [dueDay, setDueDay]         = useState("1");
  const [status, setStatus]         = useState("active");
  const [notes, setNotes]           = useState("");

  const { toasts, showToast, removeToast } = useToast();

  // Unidades filtradas por propiedad seleccionada
  const filteredUnits = useMemo(() => {
    if (!propertyId) return [];
    return units.filter((u) => String(u.propertyId) === String(propertyId));
  }, [units, propertyId]);

  useEffect(() => { loadInitialData(); loadLeases(); }, []);

  // Si cambia la propiedad, resetea la unidad
  useEffect(() => {
    const exists = filteredUnits.some((u) => u._id === unitId);
    if (!exists) setUnitId("");
  }, [propertyId, filteredUnits, unitId]);

  async function loadInitialData() {
    try {
      const [propsRes, tenantsRes] = await Promise.all([
        apiFetch("/api/properties"),
        apiFetch("/api/tenants"),
      ]);
      const props = propsRes.properties || [];
      setProperties(props);
      setTenants(tenantsRes.tenants || []);

      // Carga todas las unidades de todas las propiedades
      const allUnits = [];
      for (const p of props) {
        try {
          const r = await apiFetch(`/api/properties/${p._id}/units`);
          allUnits.push(...(r.units || []).map((u) => ({ ...u, propertyId: u.propertyId || p._id })));
        } catch {/* ignora propiedades sin unidades */}
      }
      setUnits(allUnits);
    } catch (err) {
      showToast(err.message || "No se pudieron cargar los datos", "error");
    } finally {
      setLoadingData(false);
    }
  }

  async function loadLeases() {
    try {
      const data = await apiFetch("/api/leases");
      setLeases(data.leases || []);
    } catch (err) {
      showToast(err.message || "No se pudieron cargar los contratos", "error");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setPropertyId(""); setUnitId(""); setTenantId("");
    setStartDate(""); setEndDate(""); setMonthlyRent("");
    setDeposit(""); setDueDay("1"); setStatus("active"); setNotes("");
  }

  function getId(field) {
    return (field && typeof field === "object") ? field._id || "" : field || "";
  }

  function startEdit(lease) {
    setEditingId(lease._id);
    setPropertyId(getId(lease.propertyId));
    setUnitId(getId(lease.unitId));
    setTenantId(getId(lease.tenantId));
    setStartDate(fmtDate(lease.startDate));
    setEndDate(fmtDate(lease.endDate));
    setMonthlyRent(String(lease.monthlyRent ?? ""));
    setDeposit(String(lease.deposit ?? ""));
    setDueDay(String(lease.dueDay ?? 1));
    setStatus(lease.status || "active");
    setNotes(lease.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!propertyId || !unitId || !tenantId || !startDate || !endDate || !monthlyRent) {
      showToast("Completa propiedad, unidad, inquilino, fechas y renta", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        unitId, tenantId,
        startDate, endDate,
        monthlyRent: Number(monthlyRent),
        deposit: Number(deposit || 0),
        dueDay: Number(dueDay || 1),
        status, notes: notes.trim(),
      };
      if (editingId) {
        const data = await apiFetch(`/api/leases/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        setLeases((prev) => prev.map((l) => (l._id === editingId ? data.lease : l)));
        showToast("Contrato actualizado correctamente", "success");
      } else {
        await apiFetch("/api/leases", { method: "POST", body: JSON.stringify(payload) });
        await loadLeases();
        showToast("Contrato creado correctamente", "success");
      }
      resetForm();
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este contrato?")) return;
    try {
      await apiFetch(`/api/leases/${id}`, { method: "DELETE" });
      setLeases((prev) => prev.filter((l) => l._id !== id));
      if (editingId === id) resetForm();
      showToast("Contrato eliminado", "info");
    } catch (err) {
      showToast(err.message || "No se pudo eliminar", "error");
    }
  }

  function getLabel(field, fallback = "—") {
    if (!field) return fallback;
    if (typeof field === "object") return field.fullName || field.name || field.unitNumber || fallback;
    return fallback;
  }

  return (
    <div>
      <h1 style={pageTitle}>Contratos de alquiler</h1>
      <p style={pageSubtitle}>Gestiona los contratos de arrendamiento de tus propiedades.</p>

      <div style={twoColLayout}>
        {/* ── Formulario ── */}
        <div style={pageCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>{editingId ? "Editar contrato" : "Nuevo contrato"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ ...btn.neutral, padding: "7px 12px", fontSize: "13px" }}>
                Cancelar
              </button>
            )}
          </div>

          {loadingData ? (
            <LoadingRows count={4} height={44} />
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={formField}>
                <label style={labelStyle}>Propiedad *</label>
                <select style={formInput} value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                  <option value="">Selecciona una propiedad</option>
                  {properties.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div style={formField}>
                <label style={labelStyle}>Unidad *</label>
                <select style={formInput} value={unitId} onChange={(e) => setUnitId(e.target.value)} disabled={!propertyId}>
                  <option value="">{propertyId ? "Selecciona una unidad" : "Selecciona propiedad primero"}</option>
                  {filteredUnits.map((u) => <option key={u._id} value={u._id}>Unidad {u.unitNumber} — {fmtMoney(u.rent)}/mes</option>)}
                </select>
              </div>
              <div style={formField}>
                <label style={labelStyle}>Inquilino *</label>
                <select style={formInput} value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
                  <option value="">Selecciona un inquilino</option>
                  {tenants.map((t) => <option key={t._id} value={t._id}>{t.fullName}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={formField}>
                  <label style={labelStyle}>Fecha inicio *</label>
                  <input style={formInput} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div style={formField}>
                  <label style={labelStyle}>Fecha fin *</label>
                  <input style={formInput} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={formField}>
                  <label style={labelStyle}>Renta mensual *</label>
                  <input style={formInput} type="number" min="0" placeholder="0" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} />
                </div>
                <div style={formField}>
                  <label style={labelStyle}>Depósito</label>
                  <input style={formInput} type="number" min="0" placeholder="0" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={formField}>
                  <label style={labelStyle}>Día de pago (1–28)</label>
                  <input style={formInput} type="number" min="1" max="28" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
                </div>
                <div style={formField}>
                  <label style={labelStyle}>Estado</label>
                  <select style={formInput} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="ended">Finalizado</option>
                  </select>
                </div>
              </div>
              <div style={formField}>
                <label style={labelStyle}>Notas (opcional)</label>
                <textarea style={{ ...formInput, minHeight: "76px", resize: "vertical" }} placeholder="Observaciones..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <button type="submit" style={{ ...btn.primary, width: "100%" }} disabled={saving}>
                {saving ? (editingId ? "Guardando..." : "Creando...") : (editingId ? "Guardar cambios" : "Crear contrato")}
              </button>
            </form>
          )}
        </div>

        {/* ── Listado ── */}
        <div style={pageCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>Listado de contratos</h2>
            <CountBadge count={leases.length} />
          </div>

          {loading ? (
            <LoadingRows count={3} height={120} />
          ) : leases.length === 0 ? (
            <EmptyLeases />
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {leases.map((l) => (
                <div
                  key={l._id}
                  style={{
                    background: editingId === l._id ? "rgba(37,99,235,0.07)" : "rgba(255,255,255,0.04)",
                    border: editingId === l._id ? "1px solid rgba(37,99,235,0.25)" : "1px solid rgba(255,255,255,0.07)",
                    borderLeft: `3px solid ${l.status === "active" ? "#22c55e" : l.status === "pending" ? "#f59e0b" : "#64748b"}`,
                    borderRadius: "0 12px 12px 0",
                    padding: "14px 16px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>
                          {getLabel(l.tenantId)} — Unidad {getLabel(l.unitId)}
                        </span>
                        <LeaseStatusBadge status={l.status} />
                      </div>
                      <InfoRow label="Propiedad" value={getLabel(l.propertyId)} />
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        <InfoRow label="Renta" value={fmtMoney(l.monthlyRent)} />
                        <InfoRow label="Depósito" value={fmtMoney(l.deposit)} />
                        <InfoRow label="Pago día" value={l.dueDay} />
                      </div>
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        <InfoRow label="Inicio" value={fmtDate(l.startDate)} />
                        <InfoRow label="Fin" value={fmtDate(l.endDate)} />
                      </div>
                      {l.notes && <InfoRow label="Notas" value={l.notes} />}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button onClick={() => startEdit(l)} style={{ ...btn.warning, padding: "7px 12px", fontSize: "12px" }}>Editar</button>
                      <button onClick={() => handleDelete(l._id)} style={{ ...btn.danger, padding: "7px 12px", fontSize: "12px" }}>Eliminar</button>
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