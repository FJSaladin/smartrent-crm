import { useEffect, useState } from "react";

/**
 * useToast — hook para manejar notificaciones
 *
 * Uso:
 *   const { toasts, showToast, removeToast } = useToast();
 *   showToast("Guardado correctamente", "success");
 *   showToast("Error al guardar", "error");
 *   showToast("Procesando...", "info");
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = "success", duration = 3500) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, showToast, removeToast };
}

/**
 * ToastItem — un toast individual con animación de entrada/salida
 */
function ToastItem({ message, type = "success", duration = 3500, onClose }) {
  const [visible, setVisible] = useState(false);

  // Trigger animación de entrada en el siguiente frame
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-cierre
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 280);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const styles = {
    success: { bg: "#052e16", border: "#166534", color: "#4ade80", icon: "✓", iconBg: "#16a34a" },
    error:   { bg: "#2d0a0a", border: "#991b1b", color: "#f87171", icon: "✕", iconBg: "#dc2626" },
    info:    { bg: "#0c1a2e", border: "#1e40af", color: "#60a5fa", icon: "i", iconBg: "#2563eb" },
  };

  const s = styles[type] || styles.success;

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(onClose, 280); }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 14px",
        borderRadius: "10px",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontSize: "13px",
        fontFamily: "inherit",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        maxWidth: "340px",
        cursor: "pointer",
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease",
      }}
    >
      <div style={{
        width: "20px", height: "20px", borderRadius: "50%",
        background: s.iconBg, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "10px", fontWeight: "700", flexShrink: 0,
      }}>
        {s.icon}
      </div>
      <span style={{ flex: 1, lineHeight: 1.45 }}>{message}</span>
      <span style={{ fontSize: "16px", opacity: 0.4, flexShrink: 0, lineHeight: 1 }}>×</span>
    </div>
  );
}

/**
 * ToastContainer — renderiza todos los toasts activos en esquina inferior derecha
 * Colócalo al final de tu JSX en cada página.
 */
export function ToastContainer({ toasts, onClose }) {
  if (!toasts?.length) return null;

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px",
      zIndex: 9999, display: "flex", flexDirection: "column",
      gap: "10px", pointerEvents: "none",
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <ToastItem
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onClose(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}