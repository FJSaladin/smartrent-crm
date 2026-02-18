import { useState } from "react";

const mockProperties = [
  { id: 1, name: "Apt. 3B — Torre Norte", tenant: "María García", rent: 850, status: "pagado", due: "2026-02-01" },
  { id: 2, name: "Local Comercial 1A", tenant: "Carlos Reyes", rent: 1200, status: "pendiente", due: "2026-02-15" },
  { id: 3, name: "Estudio 7 — Residencias Sol", tenant: "Ana Martínez", rent: 550, status: "pagado", due: "2026-02-01" },
  { id: 4, name: "Casa 12 — Urb. Las Palmas", tenant: "Luis Fernández", rent: 1500, status: "vencido", due: "2026-01-28" },
];

const mockTickets = [
  { id: 1, property: "Apt. 3B", issue: "Filtración en techo", priority: "alta", status: "abierto" },
  { id: 2, property: "Casa 12", issue: "Aire acondicionado", priority: "media", status: "en progreso" },
  { id: 3, property: "Estudio 7", issue: "Llave de agua rota", priority: "baja", status: "cerrado" },
];

const nav = ["Dashboard", "Propiedades", "Inquilinos", "Contratos", "Pagos", "Mantenimiento", "IA Chat"];
const navIcons = ["◉", "🏢", "👥", "📄", "💳", "🔧", "✦"];

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const totalRent = mockProperties.reduce((a, p) => a + p.rent, 0);
  const paid = mockProperties.filter(p => p.status === "pagado").length;
  const pending = mockProperties.filter(p => p.status === "pendiente").length;
  const overdue = mockProperties.filter(p => p.status === "vencido").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-root {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #080810;
          color: #e2e2ef;
        }

        /* SIDEBAR */
        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: #0d0d18;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          padding: 28px 16px;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          transition: width 0.3s ease;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
          margin-bottom: 36px;
        }

        .sidebar-brand-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #6366f1, #14b8a6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .sidebar-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
        }

        .sidebar-brand-name span { color: #6366f1; }

        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          padding: 0 12px;
          margin-bottom: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          color: rgba(255,255,255,0.4);
          font-size: 14px;
          font-weight: 400;
          margin-bottom: 2px;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }

        .nav-item.active {
          background: rgba(99,102,241,0.15);
          color: #818cf8;
          font-weight: 500;
        }

        .nav-icon { font-size: 15px; width: 20px; text-align: center; }

        .nav-badge {
          margin-left: auto;
          background: #dc2626;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 20px;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          cursor: pointer;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, #6366f1, #14b8a6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          font-family: 'Syne', sans-serif;
          flex-shrink: 0;
        }

        .user-info { overflow: hidden; }
        .user-name { font-size: 13px; font-weight: 500; color: #e2e2ef; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 11px; color: rgba(255,255,255,0.3); }

        /* MAIN */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* TOPBAR */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: #080810;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .topbar-left h1 {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .topbar-left p {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          margin-top: 2px;
        }

        .topbar-right { display: flex; align-items: center; gap: 12px; }

        .topbar-btn {
          padding: 9px 18px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s;
        }

        .topbar-btn.outline {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
        }

        .topbar-btn.outline:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .topbar-btn.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
        }

        .topbar-btn.primary:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.45); transform: translateY(-1px); }

        .notif-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          position: relative;
          transition: background 0.15s;
        }

        .notif-btn:hover { background: rgba(255,255,255,0.09); }

        .notif-dot {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 7px;
          height: 7px;
          background: #6366f1;
          border-radius: 50%;
          border: 1.5px solid #080810;
        }

        /* CONTENT */
        .content { padding: 32px; flex: 1; }

        /* KPI GRID */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .kpi-card {
          background: #0d0d18;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }

        .kpi-card:hover { border-color: rgba(99,102,241,0.25); transform: translateY(-2px); }

        .kpi-card::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -20px;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          opacity: 0.06;
        }

        .kpi-card.violet::before { background: #6366f1; }
        .kpi-card.teal::before { background: #14b8a6; }
        .kpi-card.amber::before { background: #f59e0b; }
        .kpi-card.red::before { background: #ef4444; }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .kpi-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
        }

        .kpi-icon.violet { background: rgba(99,102,241,0.15); }
        .kpi-icon.teal { background: rgba(20,184,166,0.15); }
        .kpi-icon.amber { background: rgba(245,158,11,0.15); }
        .kpi-icon.red { background: rgba(239,68,68,0.15); }

        .kpi-trend {
          font-size: 12px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 20px;
        }

        .kpi-trend.up { background: rgba(20,184,166,0.12); color: #14b8a6; }
        .kpi-trend.down { background: rgba(239,68,68,0.12); color: #f87171; }
        .kpi-trend.neutral { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }

        .kpi-value {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          margin-bottom: 4px;
        }

        .kpi-label { font-size: 13px; color: rgba(255,255,255,0.35); }

        /* BOTTOM GRID */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 20px;
        }

        /* SECTION CARD */
        .section-card {
          background: #0d0d18;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .section-action {
          font-size: 12px;
          color: #6366f1;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }

        .section-action:hover { color: #818cf8; }

        /* PROPERTY TABLE */
        .prop-table { width: 100%; }

        .prop-row {
          display: grid;
          grid-template-columns: 2fr 1.2fr 1fr 1fr;
          align-items: center;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
          gap: 12px;
        }

        .prop-row:last-child { border-bottom: none; }
        .prop-row:hover { background: rgba(255,255,255,0.02); }

        .prop-row.header {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          padding-bottom: 10px;
        }

        .prop-name { font-size: 13px; font-weight: 500; color: #e2e2ef; }
        .prop-tenant { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .prop-rent { font-size: 14px; font-weight: 600; color: #fff; font-family: 'Syne', sans-serif; }
        .prop-date { font-size: 12px; color: rgba(255,255,255,0.35); }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .status-pill::before { content: ''; width: 5px; height: 5px; border-radius: 50%; }

        .status-pill.pagado { background: rgba(20,184,166,0.12); color: #14b8a6; }
        .status-pill.pagado::before { background: #14b8a6; }

        .status-pill.pendiente { background: rgba(245,158,11,0.12); color: #f59e0b; }
        .status-pill.pendiente::before { background: #f59e0b; }

        .status-pill.vencido { background: rgba(239,68,68,0.12); color: #f87171; }
        .status-pill.vencido::before { background: #ef4444; }

        /* TICKETS */
        .ticket-list { padding: 8px 0; }

        .ticket-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
          cursor: pointer;
        }

        .ticket-item:last-child { border-bottom: none; }
        .ticket-item:hover { background: rgba(255,255,255,0.02); }

        .ticket-priority {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .ticket-priority.alta { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.5); }
        .ticket-priority.media { background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.4); }
        .ticket-priority.baja { background: #14b8a6; }

        .ticket-info { flex: 1; min-width: 0; }
        .ticket-prop { font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 2px; }
        .ticket-issue { font-size: 13px; color: #e2e2ef; font-weight: 500; }

        .ticket-status-pill {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ticket-status-pill.abierto { background: rgba(239,68,68,0.12); color: #f87171; }
        .ticket-status-pill.progreso { background: rgba(245,158,11,0.12); color: #f59e0b; }
        .ticket-status-pill.cerrado { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); }

        /* AI BANNER */
        .ai-banner {
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(20,184,166,0.08));
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .ai-banner-left { display: flex; align-items: center; gap: 14px; }
        .ai-banner-icon { font-size: 28px; }
        .ai-banner-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .ai-banner-sub { font-size: 12px; color: rgba(255,255,255,0.35); }

        .ai-banner-btn {
          padding: 9px 18px;
          background: rgba(99,102,241,0.2);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 10px;
          color: #818cf8;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ai-banner-btn:hover { background: rgba(99,102,241,0.3); color: #a5b4fc; }

        @media (max-width: 1100px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .bottom-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-root">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">🏠</div>
            <span className="sidebar-brand-name">Smart<span>Rent</span></span>
          </div>

          <div className="nav-section-label" style={{ marginBottom: 8 }}>Principal</div>
          {nav.map((item, i) => (
            <button
              key={item}
              className={`nav-item ${activeNav === item ? "active" : ""}`}
              onClick={() => setActiveNav(item)}
            >
              <span className="nav-icon">{navIcons[i]}</span>
              {item}
              {item === "Mantenimiento" && <span className="nav-badge">2</span>}
              {item === "Pagos" && <span className="nav-badge">1</span>}
            </button>
          ))}

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">FA</div>
              <div className="user-info">
                <div className="user-name">Fausto Arredondo</div>
                <div className="user-role">Propietario</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          {/* TOPBAR */}
          <header className="topbar">
            <div className="topbar-left">
              <h1>Panel de Control</h1>
              <p>Miércoles, 18 de febrero de 2026</p>
            </div>
            <div className="topbar-right">
              <div className="notif-btn">
                🔔
                <span className="notif-dot" />
              </div>
              <button className="topbar-btn outline">Exportar</button>
              <button className="topbar-btn primary">+ Añadir propiedad</button>
            </div>
          </header>

          {/* CONTENT */}
          <div className="content">

            {/* AI BANNER */}
            <div className="ai-banner">
              <div className="ai-banner-left">
                <span className="ai-banner-icon">✦</span>
                <div>
                  <div className="ai-banner-title">Asistente IA activo</div>
                  <div className="ai-banner-sub">3 contratos próximos a vencer · 1 pago en riesgo detectado</div>
                </div>
              </div>
              <button className="ai-banner-btn">Ver análisis →</button>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
              <div className="kpi-card violet">
                <div className="kpi-top">
                  <div className="kpi-icon violet">💰</div>
                  <span className="kpi-trend up">↑ 12%</span>
                </div>
                <div className="kpi-value">${totalRent.toLocaleString()}</div>
                <div className="kpi-label">Ingresos mensuales</div>
              </div>

              <div className="kpi-card teal">
                <div className="kpi-top">
                  <div className="kpi-icon teal">🏢</div>
                  <span className="kpi-trend neutral">Total</span>
                </div>
                <div className="kpi-value">{mockProperties.length}</div>
                <div className="kpi-label">Propiedades activas</div>
              </div>

              <div className="kpi-card amber">
                <div className="kpi-top">
                  <div className="kpi-icon amber">⏳</div>
                  <span className="kpi-trend neutral">{pending} pend.</span>
                </div>
                <div className="kpi-value">{paid}/{mockProperties.length}</div>
                <div className="kpi-label">Pagos recibidos</div>
              </div>

              <div className="kpi-card red">
                <div className="kpi-top">
                  <div className="kpi-icon red">🔧</div>
                  <span className="kpi-trend down">↑ 1 nueva</span>
                </div>
                <div className="kpi-value">{mockTickets.filter(t => t.status !== "cerrado").length}</div>
                <div className="kpi-label">Tickets abiertos</div>
              </div>
            </div>

            {/* BOTTOM */}
            <div className="bottom-grid">
              {/* PROPERTIES TABLE */}
              <div className="section-card">
                <div className="section-header">
                  <span className="section-title">Propiedades & Pagos</span>
                  <button className="section-action">Ver todas →</button>
                </div>
                <div className="prop-table">
                  <div className="prop-row header">
                    <span>Propiedad</span>
                    <span>Renta</span>
                    <span>Estado</span>
                    <span>Vencimiento</span>
                  </div>
                  {mockProperties.map(p => (
                    <div className="prop-row" key={p.id}>
                      <div>
                        <div className="prop-name">{p.name}</div>
                        <div className="prop-tenant">{p.tenant}</div>
                      </div>
                      <div className="prop-rent">${p.rent}</div>
                      <span className={`status-pill ${p.status}`}>{p.status}</span>
                      <div className="prop-date">{p.due}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TICKETS */}
              <div className="section-card">
                <div className="section-header">
                  <span className="section-title">Mantenimiento</span>
                  <button className="section-action">Ver todos →</button>
                </div>
                <div className="ticket-list">
                  {mockTickets.map(t => (
                    <div className="ticket-item" key={t.id}>
                      <span className={`ticket-priority ${t.priority}`} />
                      <div className="ticket-info">
                        <div className="ticket-prop">{t.property}</div>
                        <div className="ticket-issue">{t.issue}</div>
                      </div>
                      <span className={`ticket-status-pill ${t.status === "en progreso" ? "progreso" : t.status}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}