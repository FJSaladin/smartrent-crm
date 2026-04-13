import { Routes, Route } from "react-router-dom";

// ── Auth pages ────────────────────────────────────────────────────────────────
import Login              from "./pages/Login";
import Register           from "./pages/Register";
import ForgotPassword     from "./pages/ForgotPassword";
import ResetPassword      from "./pages/ResetPassword";
import VerifyEmail        from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";

// ── Landlord pages ────────────────────────────────────────────────────────────
import Dashboard    from "./pages/Dashboard";
import Properties   from "./pages/Properties";
import Units        from "./pages/Units";
import Tenants      from "./pages/Tenants";
import Leases       from "./pages/Leases";
import Tickets      from "./pages/tickets";

// ── Tenant portal pages ───────────────────────────────────────────────────────
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantTickets   from "./pages/tenant/TenantTickets";

// ── Layouts y guards ──────────────────────────────────────────────────────────
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout      from "./components/AppLayout";
import TenantLayout   from "./components/TenantLayout";

export default function App() {
  return (
    <Routes>
      {/* ── Rutas públicas (auth) ── */}
      <Route path="/"                    element={<Login />} />
      <Route path="/register"            element={<Register />} />
      <Route path="/forgot-password"     element={<ForgotPassword />} />
      <Route path="/reset-password"      element={<ResetPassword />} />
      <Route path="/verify-email"        element={<VerifyEmail />} />
      <Route path="/resend-verification" element={<ResendVerification />} />

      {/* ── Rutas del landlord ── */}
      <Route
        element={
          <ProtectedRoute requiredRole="landlord">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/properties"  element={<Properties />} />
        <Route path="/units"       element={<Units />} />
        <Route path="/tenants"     element={<Tenants />} />
        <Route path="/leases"      element={<Leases />} />
        <Route path="/tickets"     element={<Tickets />} />
      </Route>

      {/* ── Portal del tenant ── */}
      <Route
        element={
          <ProtectedRoute requiredRole="tenant">
            <TenantLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/tenant/tickets"   element={<TenantTickets />} />
      </Route>
    </Routes>
  );
}