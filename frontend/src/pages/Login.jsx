import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, setToken, setUserRole, getToken, clearToken } from "../services/api";
import "./auth.css";

function redirectByRole(role, navigate) {
  if (role === "tenant") {
    navigate("/tenant/dashboard");
  } else {
    navigate("/dashboard");
  }
}

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("landlord");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  // Si ya hay sesión activa, redirigir según el rol guardado
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setChecking(false);
      return;
    }
    apiFetch("/api/auth/me")
      .then((data) => {
        redirectByRole(data.user?.role, navigate);
      })
      .catch(() => {
        clearToken();
        setChecking(false);
      });
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Debes completar correo y contraseña");
      return;
    }

    if (cleanPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          role,
        }),
      });

      setToken(data.token);
      setUserRole(data.user.role);
      redirectByRole(data.user.role, navigate);
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  function goToResendVerification() {
    navigate("/resend-verification", {
      state: { email: email.trim().toLowerCase() },
    });
  }

  // Mientras verifica sesión activa, no renderizar el formulario
  if (checking) return null;

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-left">
          <div className="brand">
            <div className="brand-badge">🏠</div>
            <div>SmartRent CRM</div>
          </div>

          <div className="hero">
            <h1>
              Gestiona tus <br />
              propiedades <br />
              <span className="accent">sin fricción.</span>
            </h1>
            <p>
              Centraliza contratos, pagos y mantenimiento en una plataforma
              inteligente diseñada para landlords modernos.
            </p>

            <div className="stats">
              <div className="stat">
                <div className="kpi" style={{ color: "var(--good)" }}>98%</div>
                <div className="label">Pagos a tiempo</div>
              </div>
              <div className="stat">
                <div className="kpi">3.2x</div>
                <div className="label">Más eficiencia</div>
              </div>
              <div className="stat">
                <div className="kpi">24h</div>
                <div className="label">Respuesta media</div>
              </div>
              <div className="stat">
                <div
                  className="kpi"
                  style={{
                    background: "linear-gradient(90deg, var(--accent), var(--accent2))",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  IA
                </div>
                <div className="label">Asistente activo</div>
              </div>
            </div>
          </div>

          <div className="footer-bullets">
            <span><span className="dot" />Seguro y cifrado</span>
            <span><span className="dot" />Siempre disponible</span>
            <span><span className="dot" />IA integrada</span>
          </div>
        </div>

        <div className="auth-right">
          <div className="panel">
            <h2>Bienvenido de nuevo</h2>
            <p className="subtitle">Inicia sesión para acceder a tu panel</p>

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

            <form onSubmit={handleLogin}>
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
                <label>Contraseña</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                <span />
                <button
                  type="button"
                  className="link"
                  onClick={() => navigate("/forgot-password")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="row">
                <span />
                <button
                  type="button"
                  className="link"
                  onClick={goToResendVerification}
                >
                  Reenviar correo de confirmación
                </button>
              </div>

              {error && <p className="error">{error}</p>}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Iniciando..." : "Iniciar sesión →"}
              </button>
            </form>

            <div className="divider" />

            <p className="small">
              ¿No tienes cuenta?{" "}
              <button
                className="link"
                type="button"
                onClick={() => navigate("/register")}
              >
                Crear cuenta gratis
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}