import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import "./auth.css";

export default function ResendVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleResend(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Debes ingresar un correo");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/resend-verification-email", {
        method: "POST",
        body: JSON.stringify({ email: cleanEmail }),
      });

      setSuccess(data.message || "Correo reenviado correctamente");
    } catch (err) {
      setError(err.message || "No se pudo reenviar el correo");
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
              Reenvía tu <br />
              correo de <br />
              <span className="accent">confirmación.</span>
            </h1>
            <p>
              Si no recibiste el correo, puedes solicitar uno nuevo desde aquí.
            </p>
          </div>

          <div className="footer-bullets">
            <span><span className="dot" />Verificación segura</span>
            <span><span className="dot" />Reenvío inmediato</span>
          </div>
        </div>

        <div className="auth-right">
          <div className="panel">
            <h2>Reenviar confirmación</h2>
            <p className="subtitle">Introduce tu correo electrónico</p>

            <form onSubmit={handleResend}>
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
                {loading ? "Enviando..." : "Reenviar correo →"}
              </button>
            </form>

            <div className="divider" />

            <p className="small">
              <button className="link" type="button" onClick={() => navigate("/")}>
                Volver al login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}