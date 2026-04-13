/**
 * EmptyState — pantalla de estado vacío para listas sin datos
 *
 * Uso:
 *   <EmptyState icon="🏢" title="Sin propiedades" message="Crea la primera..." />
 *
 * O usa los helpers pre-configurados:
 *   <EmptyProperties />
 *   <EmptyUnits />
 *   <EmptyTenants />
 *   <EmptyLeases />
 *   <EmptyTickets />
 */
export function EmptyState({ icon = "📭", title, message, action }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "44px 24px", textAlign: "center",
      background: "rgba(255,255,255,0.02)",
      border: "1px dashed rgba(255,255,255,0.1)",
      borderRadius: "14px", gap: "10px",
    }}>
      <div style={{
        width: "52px", height: "52px", borderRadius: "14px",
        background: "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "24px",
      }}>
        {icon}
      </div>

      {title && (
        <p style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>
          {title}
        </p>
      )}

      {message && (
        <p style={{
          margin: 0, fontSize: "13px", color: "#94a3b8",
          maxWidth: "260px", lineHeight: "1.6",
        }}>
          {message}
        </p>
      )}

      {action && <div style={{ marginTop: "8px" }}>{action}</div>}
    </div>
  );
}

/**
 * LoadingRows — skeleton loader que simula tarjetas cargando
 * Mucho mejor UX que un texto "Cargando..."
 *
 * Uso:
 *   {loading ? <LoadingRows count={3} /> : <MiLista />}
 */
export function LoadingRows({ count = 3, height = 72 }) {
  return (
    <>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.25; }
        }
      `}</style>
      <div style={{ display: "grid", gap: "10px" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              height: `${height}px`,
              borderRadius: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.06)",
              animation: `skeletonPulse 1.5s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ─── Variantes pre-configuradas ───────────────────────────────────────────────

export function EmptyProperties() {
  return (
    <EmptyState
      icon="🏢"
      title="Sin propiedades"
      message="Crea tu primera propiedad para empezar a gestionar unidades e inquilinos."
    />
  );
}

export function EmptyUnits() {
  return (
    <EmptyState
      icon="🚪"
      title="Sin unidades"
      message="Esta propiedad aún no tiene unidades. Agrégalas desde el formulario."
    />
  );
}

export function EmptyTenants() {
  return (
    <EmptyState
      icon="👥"
      title="Sin inquilinos"
      message="Aún no hay inquilinos registrados. Crea el primero usando el formulario."
    />
  );
}

export function EmptyLeases() {
  return (
    <EmptyState
      icon="📄"
      title="Sin contratos"
      message="No hay contratos activos. Crea uno asignando una unidad y un inquilino."
    />
  );
}

export function EmptyTickets() {
  return (
    <EmptyState
      icon="✅"
      title="Todo en orden"
      message="No hay tickets que coincidan con los filtros seleccionados."
    />
  );
}