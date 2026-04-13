import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../services/api";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = getToken();
  const role = getUserRole();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Redirigir al portal correcto según el rol real del usuario
    if (role === "tenant") {
      return <Navigate to="/tenant/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}