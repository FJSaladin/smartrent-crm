import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import "./auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Debes ingresar tu correo electrónico");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: cleanEmail }),
      });

      setSuccess(
        data.message ||
          "Si el correo existe, se enviará un enlace para restablecer la contraseña"
      );
    } catch (err) {
      setError(err.message || "No se pudo procesar la solicitud");
    } finally {
      setLoading(false);
    }
  }

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
              Recupera tu <br />
              acceso de forma <br />
              <span className="accent">segura.</span>
            </h1>
            <p>
              Introduce tu correo electrónico y te enviaremos un enlace para
              restablecer tu contraseña.
            </p>

            <div className="stats">
              <div className="stat">
                <div className="kpi">Seguro</div>
                <div className="label">Enlace temporal</div>
              </div>
              <div className="stat">
                <div className="kpi">15 min</div>
                <div className="label">Tiempo de expiración</div>
              </div>
            </div>
          </div>

          <div className="footer-bullets">
            <span><span className="dot" />Protección de cuenta</span>
            <span><span className="dot" />Acceso seguro</span>
          </div>
        </div>

        <div className="auth-right">
          <div className="panel">
            <h2>Recuperar contraseña</h2>
            <p className="subtitle">
              Te enviaremos un enlace a tu correo electrónico
            </p>

            <form onSubmit={handleForgotPassword}>
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

              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace →"}
              </button>
            </form>

            <div className="divider" />

            <p className="small">
              <button
                className="link"
                type="button"
                onClick={() => navigate("/")}
              >
                Volver a iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}