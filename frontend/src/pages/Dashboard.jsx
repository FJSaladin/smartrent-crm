export default function Dashboard() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p style={{ color: "#cbd5e1" }}>
        Bienvenido a SmartRent CRM. Desde aquí podrás acceder a los módulos del sistema.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "24px",
        }}
      >
        <div style={cardStyle}>
          <h3>Properties</h3>
          <p>Gestiona propiedades registradas.</p>
        </div>

        <div style={cardStyle}>
          <h3>Tenants</h3>
          <p>Administra inquilinos y perfiles.</p>
        </div>

        <div style={cardStyle}>
          <h3>Leases</h3>
          <p>Consulta contratos activos e historial.</p>
        </div>

        <div style={cardStyle}>
          <h3>Tickets</h3>
          <p>Visualiza reportes y mantenimiento.</p>
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