import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("landlord");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
        }

        /* LEFT PANEL */
        .login-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          overflow: hidden;
          background: linear-gradient(135deg, #0d1117 0%, #0a0a1a 50%, #0d0f1a 100%);
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: -120px;
          left: -80px;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-left::after {
          content: '';
          position: absolute;
          bottom: -100px;
          right: -60px;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #14b8a6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .brand-name span {
          color: #6366f1;
        }

        .left-content {
          position: relative;
          z-index: 1;
        }

        .left-tagline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 3.5vw, 48px);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 24px;
        }

        .left-tagline .accent {
          background: linear-gradient(90deg, #6366f1, #14b8a6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-description {
          font-size: 15px;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          max-width: 360px;
          margin-bottom: 48px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          max-width: 380px;
        }

        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 20px;
          backdrop-filter: blur(8px);
        }

        .stat-number {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
        }

        .stat-number.teal { color: #14b8a6; }
        .stat-number.violet { color: #818cf8; }

        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-top: 4px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .left-footer {
          display: flex;
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        .footer-dot {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
        }

        .footer-dot::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #14b8a6;
        }

        /* RIGHT PANEL */
        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f17;
          padding: 48px;
          border-left: 1px solid rgba(255,255,255,0.05);
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .form-header {
          margin-bottom: 36px;
        }

        .form-header h2 {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.8px;
          margin-bottom: 8px;
        }

        .form-header p {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
        }

        /* ROLE TOGGLE */
        .role-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 32px;
        }

        .role-btn {
          padding: 10px;
          border: none;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: rgba(255,255,255,0.4);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .role-btn.active {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }

        /* FORM FIELDS */
        .field-group {
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .field-wrapper {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          opacity: 0.4;
          transition: opacity 0.2s;
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
        }

        .field-input::placeholder { color: rgba(255,255,255,0.2); }

        .field-input:focus {
          border-color: #6366f1;
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .field-input.active .field-icon { opacity: 0.8; }

        /* EXTRAS */
        .form-extras {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 28px;
          margin-top: -8px;
        }

        .link-btn {
          font-size: 12px;
          color: #6366f1;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
          transition: color 0.2s;
        }

        .link-btn:hover { color: #818cf8; }

        /* SUBMIT BUTTON */
        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border: none;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.2px;
          position: relative;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-btn.loading::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer 1.2s infinite;
        }

        @keyframes shimmer {
          to { left: 100%; }
        }

        /* DIVIDER */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .divider-text {
          font-size: 12px;
          color: rgba(255,255,255,0.2);
        }

        /* REGISTER LINK */
        .register-prompt {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
        }

        .register-prompt button {
          color: #14b8a6;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          padding: 0;
          margin-left: 4px;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">
        {/* LEFT */}
        <div className="login-left">
          <div className="brand">
            <div className="brand-icon">🏠</div>
            <span className="brand-name">Smart<span>Rent</span> CRM</span>
          </div>

          <div className="left-content">
            <h1 className="left-tagline">
              Gestiona tus<br />
              propiedades<br />
              <span className="accent">sin fricción.</span>
            </h1>
            <p className="left-description">
              Centraliza contratos, pagos y mantenimiento en una sola plataforma inteligente diseñada para landlords modernos.
            </p>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number teal">98%</div>
                <div className="stat-label">Pagos a tiempo</div>
              </div>
              <div className="stat-card">
                <div className="stat-number violet">3.2x</div>
                <div className="stat-label">Más eficiencia</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24h</div>
                <div className="stat-label">Respuesta media</div>
              </div>
              <div className="stat-card">
                <div className="stat-number teal">IA</div>
                <div className="stat-label">Asistente activo</div>
              </div>
            </div>
          </div>

          <div className="left-footer">
            <span className="footer-dot">Seguro y cifrado</span>
            <span className="footer-dot">Siempre disponible</span>
            <span className="footer-dot">IA integrada</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="form-container">
            <div className="form-header">
              <h2>Bienvenido de nuevo</h2>
              <p>Inicia sesión para acceder a tu panel</p>
            </div>

            {/* ROLE TOGGLE */}
            <div className="role-toggle">
              <button
                className={`role-btn ${role === "landlord" ? "active" : ""}`}
                onClick={() => setRole("landlord")}
              >
                🏢 Propietario
              </button>
              <button
                className={`role-btn ${role === "tenant" ? "active" : ""}`}
                onClick={() => setRole("tenant")}
              >
                🔑 Inquilino
              </button>
            </div>

            {/* EMAIL */}
            <div className="field-group">
              <label className="field-label">Correo electrónico</label>
              <div className="field-wrapper">
                <span className="field-icon">✉️</span>
                <input
                  type="email"
                  className="field-input"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="field-group">
              <label className="field-label">Contraseña</label>
              <div className="field-wrapper">
                <span className="field-icon">🔒</span>
                <input
                  type="password"
                  className="field-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                />
              </div>
            </div>

            <div className="form-extras">
              <button className="link-btn">¿Olvidaste tu contraseña?</button>
            </div>

            <button
              className={`submit-btn ${loading ? "loading" : ""}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión →"}
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">¿No tienes cuenta?</span>
              <div className="divider-line" />
            </div>

            <div className="register-prompt">
              <span>¿Eres nuevo aquí?</span>
              <button>Crear cuenta gratis</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}