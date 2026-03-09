import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import "./auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!token) {
      setError("Token no válido o faltante");
      return;
    }

    if (!cleanPassword || !cleanConfirmPassword) {
      setError("Debes completar ambos campos");
      return;
    }

    if (cleanPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: cleanPassword,
        }),
      });

      setSuccess(data.message || "Contraseña actualizada correctamente");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.message || "No se pudo restablecer la contraseña");
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
              Crea una nueva <br />
              contraseña y <br />
              <span className="accent">continúa.</span>
            </h1>
            <p>
              Elige una contraseña segura para recuperar el acceso a tu cuenta.
            </p>

            <div className="stats">
              <div className="stat">
                <div className="kpi">JWT</div>
                <div className="label">Autenticación segura</div>
              </div>
              <div className="stat">
                <div className="kpi">Protegido</div>
                <div className="label">Flujo seguro</div>
              </div>
            </div>
          </div>

          <div className="footer-bullets">
            <span><span className="dot" />Contraseña segura</span>
            <span><span className="dot" />Protección activa</span>
          </div>
        </div>

        <div className="auth-right">
          <div className="panel">
            <h2>Nueva contraseña</h2>
            <p className="subtitle">
              Introduce tu nueva contraseña para continuar
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="field">
                <label>Nueva contraseña</label>
                <input
                  className="input"
                  type="password"
                  placeholder="mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Confirmar contraseña</label>
                <input
                  className="input"
                  type="password"
                  placeholder="repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Actualizando..." : "Guardar nueva contraseña →"}
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