import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";

export default function Leases() {
  const [leases, setLeases] = useState([]);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredUnits = useMemo(() => {
    if (!propertyId) return [];
    return units.filter((u) => String(u.propertyId) === String(propertyId));
  }, [units, propertyId]);

  useEffect(() => {
    loadInitialData();
    loadLeases();
  }, []);

  useEffect(() => {
    if (!propertyId) {
      setUnitId("");
      return;
    }

    const stillExists = filteredUnits.some((u) => u._id === unitId);
    if (!stillExists) setUnitId("");
  }, [propertyId, filteredUnits, unitId]);

  async function loadInitialData() {
    try {
      setError("");

      const [propertiesRes, tenantsRes] = await Promise.all([
        apiFetch("/api/properties"),
        apiFetch("/api/tenants"),
      ]);

      const props = propertiesRes.properties || [];
      const tenantList = tenantsRes.tenants || [];

      setProperties(props);
      setTenants(tenantList);

      const allUnits = [];

      for (const property of props) {
        try {
          const unitsRes = await apiFetch(`/api/properties/${property._id}/units`);
          const propertyUnits = (unitsRes.units || []).map((u) => ({
            ...u,
            propertyId: u.propertyId || property._id,
          }));
          allUnits.push(...propertyUnits);
        } catch {
          // ignorar si alguna propiedad no devuelve units
        }
      }

      setUnits(allUnits);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los datos del formulario");
    } finally {
      setLoadingData(false);
    }
  }

  async function loadLeases() {
    try {
      setError("");
      const data = await apiFetch("/api/leases");
      setLeases(data.leases || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los leases");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setPropertyId("");
    setUnitId("");
    setTenantId("");
    setStartDate("");
    setEndDate("");
    setMonthlyRent("");
    setDeposit("");
    setDueDay("1");
    setStatus("active");
    setNotes("");
  }

  function resolvePropertyIdFromLease(lease) {
    if (lease.propertyId && typeof lease.propertyId === "object") {
      return lease.propertyId._id || "";
    }
    return lease.propertyId || "";
  }

  function resolveUnitIdFromLease(lease) {
    if (lease.unitId && typeof lease.unitId === "object") {
      return lease.unitId._id || "";
    }
    return lease.unitId || "";
  }

  function resolveTenantIdFromLease(lease) {
    if (lease.tenantId && typeof lease.tenantId === "object") {
      return lease.tenantId._id || "";
    }
    return lease.tenantId || "";
  }

  function formatDateForInput(value) {
    if (!value) return "";
    return new Date(value).toISOString().split("T")[0];
  }

  function startEdit(lease) {
    setEditingId(lease._id);
    setPropertyId(resolvePropertyIdFromLease(lease));
    setUnitId(resolveUnitIdFromLease(lease));
    setTenantId(resolveTenantIdFromLease(lease));
    setStartDate(formatDateForInput(lease.startDate));
    setEndDate(formatDateForInput(lease.endDate));
    setMonthlyRent(String(lease.monthlyRent ?? ""));
    setDeposit(String(lease.deposit ?? ""));
    setDueDay(String(lease.dueDay ?? 1));
    setStatus(lease.status || "active");
    setNotes(lease.notes || "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!propertyId || !unitId || !tenantId || !startDate || !endDate || !monthlyRent) {
      setError("Debes completar property, unit, tenant, fechas y renta mensual");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        unitId,
        tenantId,
        startDate,
        endDate,
        monthlyRent: Number(monthlyRent),
        deposit: Number(deposit || 0),
        dueDay: Number(dueDay || 1),
        status,
        notes: notes.trim(),
      };

      if (editingId) {
        const data = await apiFetch(`/api/leases/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setLeases((prev) =>
          prev.map((l) => (l._id === editingId ? data.lease : l))
        );
      } else {
        const data = await apiFetch("/api/leases", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        await loadLeases();
        setLeases((prev) =>
          data.lease ? [data.lease, ...prev.filter((l) => l._id !== data.lease._id)] : prev
        );
      }

      resetForm();
      await loadLeases();
    } catch (err) {
      setError(
        err.message ||
          (editingId ? "No se pudo actualizar el lease" : "No se pudo crear el lease")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLease(id) {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este lease?");
    if (!confirmed) return;

    try {
      await apiFetch(`/api/leases/${id}`, {
        method: "DELETE",
      });

      setLeases((prev) => prev.filter((l) => l._id !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "No se pudo eliminar el lease");
    }
  }

  function getPropertyLabel(lease) {
    if (lease.propertyId && typeof lease.propertyId === "object") {
      return lease.propertyId.name || "Sin propiedad";
    }
    return "Propiedad";
  }

  function getUnitLabel(lease) {
    if (lease.unitId && typeof lease.unitId === "object") {
      return lease.unitId.unitNumber || "Sin unidad";
    }
    return "Unidad";
  }

  function getTenantLabel(lease) {
    if (lease.tenantId && typeof lease.tenantId === "object") {
      return lease.tenantId.fullName || "Sin tenant";
    }
    return "Tenant";
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Alquileres</h1>
      <p style={{ color: "#cbd5e1" }}>
        Gestiona los contratos de alquiler en SmartRent.
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
              {editingId ? "Editar alquiler" : "Nuevo alquiler"}
            </h2>

            {editingId && (
              <button type="button" onClick={resetForm} style={secondaryButton}>
                Cancelar
              </button>
            )}
          </div>

          {loadingData ? (
            <p>Cargando datos del formulario...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={fieldStyle}>
                <label>Propiedad</label>
                <select
                  style={inputStyle}
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                >
                  <option value="">Selecciona una propiedad</option>
                  {properties.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.name} - {property.address}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldStyle}>
                <label>Unidad</label>
                <select
                  style={inputStyle}
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  disabled={!propertyId}
                >
                  <option value="">Selecciona una unidad</option>
                  {filteredUnits.map((unit) => (
                    <option key={unit._id} value={unit._id}>
                      Unidad {unit.unitNumber} - ${unit.rent}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldStyle}>
                <label>Inquilino</label>
                <select
                  style={inputStyle}
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                >
                  <option value="">Selecciona un inquilino</option>
                  {tenants.map((tenant) => (
                    <option key={tenant._id} value={tenant._id}>
                      {tenant.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldStyle}>
                <label>Fecha de inicio</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div style={fieldStyle}>
                <label>Fecha de fin</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div style={fieldStyle}>
                <label>Renta mensual</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                />
              </div>

              <div style={fieldStyle}>
                <label>Depósito</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                />
              </div>

              <div style={fieldStyle}>
                <label>Día de pago</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="1"
                  max="28"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
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
                  <option value="pending">Pendiente</option>
                  <option value="ended">Finalizado</option>
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
                  : "Crear lease"}
              </button>
            </form>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Listado de Alquileres</h2>

          {loading ? (
            <p>Cargando leases...</p>
          ) : leases.length === 0 ? (
            <p style={{ color: "#cbd5e1" }}>
              Aún no hay contratos registrados.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {leases.map((lease) => (
                <div
                  key={lease._id}
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
                      <h3 style={{ margin: "0 0 8px" }}>
                        {getTenantLabel(lease)} - Unidad {getUnitLabel(lease)}
                      </h3>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Property:</strong> {getPropertyLabel(lease)}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Renta:</strong> ${lease.monthlyRent}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Depósito:</strong> ${lease.deposit}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Inicio:</strong> {formatDateForInput(lease.startDate)}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Fin:</strong> {formatDateForInput(lease.endDate)}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Día de pago:</strong> {lease.dueDay}
                      </p>
                      <p style={{ margin: "0 0 6px", color: "#cbd5e1" }}>
                        <strong>Estado:</strong> {lease.status}
                      </p>
                      <p style={{ margin: 0, color: "#cbd5e1" }}>
                        <strong>Notas:</strong> {lease.notes || "Sin notas"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button onClick={() => startEdit(lease)} style={editButton}>
                        Editar
                      </button>

                      <button
                        onClick={() => handleDeleteLease(lease._id)}
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