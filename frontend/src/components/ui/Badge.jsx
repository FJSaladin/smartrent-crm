/**
 * Badge — indicador visual de estado con punto de color
 *
 * Uso directo:
 *   <Badge color="#ef4444">Alta</Badge>
 *
 * Uso con helpers pre-configurados:
 *   <PriorityBadge priority="high" />
 *   <UnitStatusBadge status="occupied" />
 *   <TicketStatusBadge status="open" />
 *   <LeaseStatusBadge status="active" />
 *   <PropertyStatusBadge status="active" />
 */
export function Badge({ children, color = "#64748b", dot = true, size = "md" }) {
  const padding = size === "sm" ? "2px 8px" : "3px 10px";
  const fontSize = size === "sm" ? "11px" : "12px";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding, fontSize, borderRadius: "999px", fontWeight: "500",
      background: `${color}1a`,
      color: color,
      border: `1px solid ${color}35`,
      whiteSpace: "nowrap",
      fontFamily: "inherit",
    }}>
      {dot && (
        <span style={{
          width: "5px", height: "5px", borderRadius: "50%",
          background: color, flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}

// ─── Mapas de colores y labels ────────────────────────────────────────────────

const PRIORITY = {
  high:   { color: "#ef4444", label: "Alta" },
  medium: { color: "#f59e0b", label: "Media" },
  low:    { color: "#22c55e", label: "Baja" },
};

const UNIT_STATUS = {
  occupied: { color: "#22c55e", label: "Ocupada" },
  vacant:   { color: "#f59e0b", label: "Vacante" },
  inactive: { color: "#64748b", label: "Inactiva" },
};

const TICKET_STATUS = {
  open:        { color: "#ef4444", label: "Abierto" },
  in_progress: { color: "#f59e0b", label: "En progreso" },
  resolved:    { color: "#22c55e", label: "Resuelto" },
  closed:      { color: "#64748b", label: "Cerrado" },
};

const LEASE_STATUS = {
  active:  { color: "#22c55e", label: "Activo" },
  pending: { color: "#f59e0b", label: "Pendiente" },
  ended:   { color: "#64748b", label: "Finalizado" },
};

const PROPERTY_STATUS = {
  active:   { color: "#22c55e", label: "Activa" },
  inactive: { color: "#64748b", label: "Inactiva" },
};

const TENANT_STATUS = {
  active:   { color: "#22c55e", label: "Activo" },
  inactive: { color: "#64748b", label: "Inactivo" },
};

// ─── Helpers pre-configurados ─────────────────────────────────────────────────

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY[priority] || { color: "#64748b", label: priority };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export function UnitStatusBadge({ status }) {
  const cfg = UNIT_STATUS[status] || { color: "#64748b", label: status };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export function TicketStatusBadge({ status }) {
  const cfg = TICKET_STATUS[status] || { color: "#64748b", label: status };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export function LeaseStatusBadge({ status }) {
  const cfg = LEASE_STATUS[status] || { color: "#64748b", label: status };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export function PropertyStatusBadge({ status }) {
  const cfg = PROPERTY_STATUS[status] || { color: "#64748b", label: status };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export function TenantStatusBadge({ status }) {
  const cfg = TENANT_STATUS[status] || { color: "#64748b", label: status };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}