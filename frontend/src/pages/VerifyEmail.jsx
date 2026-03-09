import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import "./auth.css";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Token no válido o faltante");
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch("/api/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        setSuccess(data.message || "Correo confirmado correctamente");
      } catch (err) {
        setError(err.message || "No se pudo verificar el correo");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

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
              Verificando tu <br />
              correo <br />
              <span className="accent">electrónico.</span>
            </h1>
            <p>
              Estamos confirmando tu cuenta para que puedas acceder a SmartRent CRM.
            </p>
          </div>

          <div className="footer-bullets">
            <span><span className="dot" />Cuenta segura</span>
            <span><span className="dot" />Verificación activa</span>
          </div>
        </div>

        <div className="auth-right">
          <div className="panel">
            <h2>Confirmación de correo</h2>
            <p className="subtitle">Estamos procesando tu solicitud</p>

            {loading && <p className="small">Verificando...</p>}
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <div className="divider" />

            <p className="small">
              <button className="link" type="button" onClick={() => navigate("/")}>
                Ir al login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}