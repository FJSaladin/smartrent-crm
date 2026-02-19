import { useNavigate } from "react-router-dom";
import { clearToken } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();          // Borra JWT del localStorage
    navigate("/");         // Redirige al login
  }

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Dashboard SmartRent CRM</h2>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "#ff4d6d",
            color: "white",
            fontWeight: "bold"
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <p>Bienvenido 🎉</p>
    </div>
  );
}
