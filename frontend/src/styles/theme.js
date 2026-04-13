// Colores base
export const colors = {
  // Fondos
  bg: {
    primary: "#0f172a",
    secondary: "#1e293b",
    sidebar: "#111827",
    card: "rgba(255,255,255,0.08)",
    cardHover: "rgba(255,255,255,0.11)",
    input: "rgba(255,255,255,0.06)",
    overlay: "rgba(0,0,0,0.55)",
  },

  // Bordes
  border: {
    default: "rgba(255,255,255,0.1)",
    input: "rgba(255,255,255,0.12)",
    subtle: "rgba(255,255,255,0.06)",
  },

  // Texto
  text: {
    primary: "#ffffff",
    secondary: "#cbd5e1",
    muted: "#94a3b8",
  },

  // Acciones
  action: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    neutral: "#475569",
    whatsapp: "#25d366",
  },

  // Estados de unidades
  unitStatus: {
    occupied: "#22c55e",
    vacant: "#f59e0b",
    inactive: "#64748b",
  },

  // Estados de tickets
  ticketPriority: {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#22c55e",
  },

  // Estados de lease
  leaseStatus: {
    active: "#22c55e",
    pending: "#f59e0b",
    ended: "#64748b",
  },
};

// Sombras
export const shadows = {
  card: "0 10px 25px rgba(0,0,0,0.2)",
  modal: "0 25px 70px rgba(0,0,0,0.4)",
  button: "0 4px 12px rgba(0,0,0,0.2)",
};

// Border radius
export const radius = {
  sm: "8px",
  md: "10px",
  lg: "14px",
  xl: "16px",
  xxl: "20px",
};

// Estilos de tarjeta reutilizable
export const card = {
  background: colors.bg.card,
  border: `1px solid ${colors.border.default}`,
  borderRadius: radius.xl,
  padding: "20px",
  boxShadow: shadows.card,
};

// Estilos de input reutilizable
export const input = {
  width: "100%",
  borderRadius: radius.md,
  padding: "12px 14px",
  border: `1px solid ${colors.border.input}`,
  background: colors.bg.input,
  color: colors.text.primary,
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

// Estilos de campo (label + input)
export const field = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginBottom: "14px",
};

// Botones
export const buttons = {
  primary: {
    padding: "12px 20px",
    borderRadius: radius.md,
    border: "none",
    cursor: "pointer",
    background: colors.action.primary,
    color: colors.text.primary,
    fontWeight: "bold",
    fontSize: "14px",
    boxShadow: shadows.button,
  },
  success: {
    padding: "12px 20px",
    borderRadius: radius.md,
    border: "none",
    cursor: "pointer",
    background: colors.action.success,
    color: colors.text.primary,
    fontWeight: "bold",
    fontSize: "14px",
  },
  warning: {
    padding: "10px 16px",
    borderRadius: radius.md,
    border: "none",
    cursor: "pointer",
    background: colors.action.warning,
    color: colors.text.primary,
    fontWeight: "bold",
    fontSize: "14px",
  },
  danger: {
    padding: "10px 16px",
    borderRadius: radius.md,
    border: "none",
    cursor: "pointer",
    background: colors.action.danger,
    color: colors.text.primary,
    fontWeight: "bold",
    fontSize: "14px",
  },
  neutral: {
    padding: "10px 16px",
    borderRadius: radius.md,
    border: "none",
    cursor: "pointer",
    background: colors.action.neutral,
    color: colors.text.primary,
    fontWeight: "bold",
    fontSize: "14px",
  },
  whatsapp: {
    padding: "12px 20px",
    borderRadius: radius.md,
    border: "none",
    cursor: "pointer",
    background: colors.action.whatsapp,
    color: colors.text.primary,
    fontWeight: "bold",
    fontSize: "14px",
  },
  fullWidth: {
    width: "100%",
  },
};

// Badge de estado genérico
export function getStatusBadgeStyle(color) {
  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    background: `${color}22`,
    color: color,
    border: `1px solid ${color}44`,
  };
}

// Helpers para badges específicos
export function getUnitStatusBadge(status) {
  return getStatusBadgeStyle(colors.unitStatus[status] || colors.text.muted);
}

export function getPriorityBadge(priority) {
  return getStatusBadgeStyle(colors.ticketPriority[priority] || colors.text.muted);
}

export function getLeaseStatusBadge(status) {
  return getStatusBadgeStyle(colors.leaseStatus[status] || colors.text.muted);
}