/**
 * formStyles.js — estilos de formulario compartidos entre todas las páginas
 *
 * Por qué este archivo existe:
 * Antes, cada página (Properties, Units, Tenants, Leases) redefinía
 * cardStyle, inputStyle, primaryButton, etc. con valores idénticos.
 * Ahora todos importan desde aquí. Si mañana cambias el color de los
 * botones, lo cambias en UN solo lugar.
 *
 * Uso:
 *   import { pageCard, formInput, formField, labelStyle, btn } from "../components/ui/formStyles";
 */

import { colors, card, input, field, buttons, radius } from "../../styles/theme";

// Re-exporta los del theme para que las páginas no importen de dos lugares
export { colors, card as pageCard, input as formInput, field as formField, buttons as btn, radius };

// Label del formulario — estilo consistente en todas las páginas
export const labelStyle = {
  fontSize: "12px",
  color: colors.text.muted,
  fontWeight: "500",
  letterSpacing: "0.03em",
};

// Header de sección dentro de una card (ej: "Listado de propiedades")
export const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
};

// Título h2 dentro de sección
export const sectionTitle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: "600",
  color: "#f1f5f9",
};

// Layout de dos columnas (form | list)
export const twoColLayout = {
  display: "grid",
  gridTemplateColumns: "1fr 1.4fr",
  gap: "24px",
  marginTop: "24px",
};

// Encabezado de página (h1 + descripción)
export const pageHeader = {
  marginBottom: "8px",
};

export const pageTitle = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "700",
  color: "#f8fafc",
};

export const pageSubtitle = {
  margin: "6px 0 0",
  color: colors.text.secondary,
  fontSize: "14px",
};

// Item de info dentro de una tarjeta (label: valor)
export function InfoRow({ label, value, fallback = "—" }) {
  return (
    <p style={{ margin: "0 0 5px", fontSize: "13px", color: colors.text.secondary }}>
      <span style={{ color: "#94a3b8", fontWeight: "500" }}>{label}:</span>{" "}
      <span style={{ color: "#cbd5e1" }}>{value || fallback}</span>
    </p>
  );
}

// Borde izquierdo de color para cards de prioridad (tickets)
export function getPriorityBorderColor(priority) {
  const map = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
  return map[priority] || "rgba(255,255,255,0.15)";
}

// Contador badge (ej. el número de propiedades en el header del listado)
export function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span style={{
      background: "rgba(37,99,235,0.12)",
      color: "#60a5fa",
      border: "1px solid rgba(37,99,235,0.2)",
      borderRadius: "999px",
      padding: "2px 10px",
      fontSize: "12px",
      fontWeight: "600",
    }}>
      {count}
    </span>
  );
}