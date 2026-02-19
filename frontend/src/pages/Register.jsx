import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, setToken } from "../services/api";
import "./auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("landlord");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password, role }),
      });

      setToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        {/* LEFT */}
        <div className="auth-left">
          <div className="brand">
            <div className="brand-badge">🏠</div>
            <div>SmartRent CRM</div>
          </div>

          <div className="hero">
            <h1>
              Crea tu cuenta <br />
              y empieza <br />
              <span className="accent">hoy mismo.</span>
            </h1>
            <p>
              Configura tu rol, guarda tus datos y accede al panel para gestionar
              propiedades, pagos y mantenimiento.
            </p>

            <div className="stats">
              <div className="stat">
                <div className="kpi" style={{ color: "var(--good)" }}>Rápido</div>
                <div className="label">Registro en minutos</div>
              </div>
              <div className="stat">
                <div className="kpi">Seguro</div>
                <div className="label">JWT + cifrado</div>
              </div>
              <div className="stat">
                <div className="kpi">Todo</div>
                <div className="label">En un solo lugar</div>
              </div>
              <div className="stat">
                <div className="kpi" style={{ background: "linear-gradient(90deg, var(--accent), var(--accent2))", WebkitBackgroundClip: "text", color: "transparent" }}>
                  IA
                </div>
                <div className="label">Próximamente</div>
              </div>
            </div>
          </div>

          <div className="footer-bullets">
            <span><span className="dot" />Seguro y cifrado</span>
            <span><span className="dot" />Siempre disponible</span>
            <span><span className="dot" />IA integrada</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="panel">
            <h2>Crear cuenta</h2>
            <p className="subtitle">Completa tus datos para empezar</p>

            <div className="role-tabs">
              <button
                type="button"
                className={`role-tab ${role === "landlord" ? "active" : ""}`}
                onClick={() => setRole("landlord")}
              >
                🏢 Propietario
              </button>
              <button
                type="button"
                className={`role-tab ${role === "tenant" ? "active" : ""}`}
                onClick={() => setRole("tenant")}
              >
                🔑 Inquilino
              </button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="field">
                <label>Nombre</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Correo electrónico</label>
                <input
                  className="input"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Teléfono (opcional)</label>
                <input
                  className="input"
                  type="tel"
                  placeholder="+1 809 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Contraseña</label>
                <input
                  className="input"
                  type="password"
                  placeholder="mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="error">{error}</p>}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear cuenta →"}
              </button>
            </form>

            <div className="divider" />

            <p className="small">
              ¿Ya tienes cuenta?{" "}
              <button className="link" type="button" onClick={() => navigate("/")}>
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
