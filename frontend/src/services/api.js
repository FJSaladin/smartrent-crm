const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ─── Datos mock para desarrollo sin backend ───────────────────────────────────

const MOCK_USER_LANDLORD = {
  id: "mock-landlord-001",
  name: "Fausto Arredondo",
  email: "fausto@smartrent.com",
  role: "landlord",
  isActive: true,
  emailVerified: true,
};

const MOCK_USER_TENANT = {
  id: "mock-tenant-user-001",
  name: "María García",
  email: "maria@correo.com",
  role: "tenant",
  isActive: true,
  emailVerified: true,
};

const MOCK_DATA = {
  properties: [
    { _id: "p1", name: "Torre Norte",      address: "Calle Anacaona 45, Santo Domingo", status: "active",   notes: "Edificio principal" },
    { _id: "p2", name: "Residencial Sur",  address: "Paseo 57 Villa Faro, Santiago",    status: "active",   notes: "" },
  ],
  tenants: [
    { _id: "t1", fullName: "María García", email: "maria@correo.com", phone: "809-000-0001", status: "active", notes: "", userId: "mock-tenant-user-001" },
    { _id: "t2", fullName: "Juan Pérez",   email: "juan@correo.com",  phone: "809-000-0002", status: "active", notes: "" },
  ],
  units: [
    { _id: "u1", propertyId: "p1", unitNumber: "1A",  bedrooms: 2, bathrooms: 1, rent: 15000, status: "occupied", notes: "" },
    { _id: "u2", propertyId: "p1", unitNumber: "2B",  bedrooms: 3, bathrooms: 2, rent: 20000, status: "vacant",   notes: "" },
    { _id: "u3", propertyId: "p2", unitNumber: "512", bedrooms: 1, bathrooms: 1, rent: 10000, status: "occupied", notes: "" },
  ],
  leases: [
    {
      _id: "l1",
      propertyId: { _id: "p1", name: "Torre Norte",     address: "Calle Anacaona 45, Santo Domingo" },
      unitId:     { _id: "u1", unitNumber: "1A",         rent: 15000, status: "occupied" },
      tenantId:   { _id: "t1", fullName: "María García", email: "maria@correo.com", phone: "809-000-0001" },
      startDate: "2026-01-01", endDate: "2026-12-31",
      monthlyRent: 15000, deposit: 30000, dueDay: 1,
      status: "active", notes: "",
    },
    {
      _id: "l2",
      propertyId: { _id: "p2", name: "Residencial Sur",  address: "Paseo 57 Villa Faro" },
      unitId:     { _id: "u3", unitNumber: "512",         rent: 10000, status: "occupied" },
      tenantId:   { _id: "t2", fullName: "Juan Pérez",    email: "juan@correo.com", phone: "809-000-0002" },
      startDate: "2026-03-09", endDate: "2030-12-29",
      monthlyRent: 150000, deposit: 300000, dueDay: 25,
      status: "active", notes: "",
    },
  ],
  tickets: [
    {
      _id: "tk1",
      title: "Fuga de agua en baño",
      description: "Hay una fuga en la llave del baño principal. El agua escurre constantemente incluso con la llave cerrada.",
      category: "plumbing", priority: "high", status: "open", source: "whatsapp",
      notes: "Revisar con plomero esta semana",
      communications: [],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      tenantId:   { _id: "t1", fullName: "María García", email: "maria@correo.com", phone: "809-000-0001" },
      propertyId: { _id: "p1", name: "Torre Norte",      address: "Calle Anacaona 45" },
      unitId:     { _id: "u1", unitNumber: "1A" },
      leaseId:    { _id: "l1", monthlyRent: 15000, status: "active" },
    },
    {
      _id: "tk2",
      title: "Aire acondicionado no enfría",
      description: "El AC de la sala no está funcionando correctamente desde hace una semana.",
      category: "hvac", priority: "medium", status: "in_progress", source: "dashboard",
      notes: "",
      communications: [
        { channel: "email", message: "Un técnico visitará el martes 15 de abril entre 9am y 12pm.", sentAt: new Date().toISOString() },
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      tenantId:   { _id: "t2", fullName: "Juan Pérez",  email: "juan@correo.com", phone: "809-000-0002" },
      propertyId: { _id: "p2", name: "Residencial Sur", address: "Paseo 57 Villa Faro" },
      unitId:     { _id: "u3", unitNumber: "512" },
      leaseId:    null,
    },
  ],
};

// ─── Interceptor mock ─────────────────────────────────────────────────────────

function mockResponse(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  // ── Auth ──
  if (path === "/api/auth/me") {
    const token = getToken();
    const user = token === "mock-token-tenant" ? MOCK_USER_TENANT : MOCK_USER_LANDLORD;
    return { user };
  }
  if (path === "/api/auth/login") {
    const body = options.body ? JSON.parse(options.body) : {};
    if (body.role === "tenant") {
      return { token: "mock-token-tenant", user: MOCK_USER_TENANT };
    }
    return { token: "mock-token-landlord", user: MOCK_USER_LANDLORD };
  }
  if (path.startsWith("/api/auth/")) return { ok: true, message: "Operación exitosa" };

  // ── Properties ──
  if (path === "/api/properties" && method === "GET")  return { properties: MOCK_DATA.properties };
  if (path === "/api/properties" && method === "POST") {
    const body = JSON.parse(options.body || "{}");
    const newProp = { _id: `p${Date.now()}`, ...body };
    MOCK_DATA.properties.unshift(newProp);
    return { property: newProp };
  }
  if (path.match(/^\/api\/properties\/[\w-]+$/) && method === "GET") {
    const id = path.split("/").pop();
    return { property: MOCK_DATA.properties.find((p) => p._id === id) };
  }
  if (path.match(/^\/api\/properties\/[\w-]+$/) && method === "PUT") {
    const id = path.split("/").pop();
    const body = JSON.parse(options.body || "{}");
    const idx = MOCK_DATA.properties.findIndex((p) => p._id === id);
    if (idx !== -1) MOCK_DATA.properties[idx] = { ...MOCK_DATA.properties[idx], ...body };
    return { property: MOCK_DATA.properties[idx] };
  }
  if (path.match(/^\/api\/properties\/[\w-]+$/) && method === "DELETE") {
    const id = path.split("/").pop();
    MOCK_DATA.properties = MOCK_DATA.properties.filter((p) => p._id !== id);
    return { message: "Propiedad eliminada" };
  }

  // ── Units ──
  if (path.match(/\/api\/properties\/[\w-]+\/units/) && method === "GET") {
    const propertyId = path.split("/")[3];
    return { units: MOCK_DATA.units.filter((u) => u.propertyId === propertyId) };
  }
  if (path.match(/\/api\/properties\/[\w-]+\/units/) && method === "POST") {
    const propertyId = path.split("/")[3];
    const body = JSON.parse(options.body || "{}");
    const newUnit = { _id: `u${Date.now()}`, propertyId, ...body };
    MOCK_DATA.units.unshift(newUnit);
    return { unit: newUnit };
  }
  if (path.match(/^\/api\/units\/[\w-]+$/) && method === "PUT") {
    const id = path.split("/").pop();
    const body = JSON.parse(options.body || "{}");
    const idx = MOCK_DATA.units.findIndex((u) => u._id === id);
    if (idx !== -1) MOCK_DATA.units[idx] = { ...MOCK_DATA.units[idx], ...body };
    return { unit: MOCK_DATA.units[idx] };
  }
  if (path.match(/^\/api\/units\/[\w-]+$/) && method === "DELETE") {
    const id = path.split("/").pop();
    MOCK_DATA.units = MOCK_DATA.units.filter((u) => u._id !== id);
    return { message: "Unidad eliminada" };
  }

  // ── Tenants ──
  if (path === "/api/tenants" && method === "GET")  return { tenants: MOCK_DATA.tenants };
  if (path === "/api/tenants" && method === "POST") {
    const body = JSON.parse(options.body || "{}");
    const newTenant = { _id: `t${Date.now()}`, ...body };
    MOCK_DATA.tenants.unshift(newTenant);
    return { tenant: newTenant };
  }
  if (path.match(/^\/api\/tenants\/[\w-]+$/) && method === "PUT") {
    const id = path.split("/").pop();
    const body = JSON.parse(options.body || "{}");
    const idx = MOCK_DATA.tenants.findIndex((t) => t._id === id);
    if (idx !== -1) MOCK_DATA.tenants[idx] = { ...MOCK_DATA.tenants[idx], ...body };
    return { tenant: MOCK_DATA.tenants[idx] };
  }
  if (path.match(/^\/api\/tenants\/[\w-]+$/) && method === "DELETE") {
    const id = path.split("/").pop();
    MOCK_DATA.tenants = MOCK_DATA.tenants.filter((t) => t._id !== id);
    return { message: "Inquilino eliminado" };
  }

  // ── Leases ──
  if (path === "/api/leases" && method === "GET")  return { leases: MOCK_DATA.leases };
  if (path === "/api/leases" && method === "POST") {
    const body = JSON.parse(options.body || "{}");
    const newLease = { _id: `l${Date.now()}`, ...body };
    MOCK_DATA.leases.unshift(newLease);
    return { lease: newLease };
  }
  if (path.match(/^\/api\/leases\/[\w-]+$/) && method === "PUT") {
    const id = path.split("/").pop();
    const body = JSON.parse(options.body || "{}");
    const idx = MOCK_DATA.leases.findIndex((l) => l._id === id);
    if (idx !== -1) MOCK_DATA.leases[idx] = { ...MOCK_DATA.leases[idx], ...body };
    return { lease: MOCK_DATA.leases[idx] };
  }
  if (path.match(/^\/api\/leases\/[\w-]+$/) && method === "DELETE") {
    const id = path.split("/").pop();
    MOCK_DATA.leases = MOCK_DATA.leases.filter((l) => l._id !== id);
    return { message: "Contrato eliminado" };
  }

  // ── Tickets (landlord) ──
  if (path === "/api/tickets" && method === "GET") return { tickets: MOCK_DATA.tickets };
  if (path.match(/^\/api\/tickets\/[\w-]+$/) && method === "PUT") {
    const id = path.split("/").pop();
    const body = JSON.parse(options.body || "{}");
    const idx = MOCK_DATA.tickets.findIndex((t) => t._id === id);
    if (idx !== -1) MOCK_DATA.tickets[idx] = { ...MOCK_DATA.tickets[idx], ...body };
    return { ticket: MOCK_DATA.tickets[idx] };
  }
  if (path.match(/^\/api\/tickets\/[\w-]+\/reply-email$/))     return { ticket: MOCK_DATA.tickets[0], message: "Correo enviado (mock)" };
  if (path.match(/^\/api\/tickets\/[\w-]+\/notify-whatsapp$/)) return { ticket: MOCK_DATA.tickets[0], message: "WhatsApp enviado (mock)" };

  // ── Tenant portal ──
  if (path === "/api/tenant/me") {
    const tenant = MOCK_DATA.tenants.find((t) => t.userId === "mock-tenant-user-001");
    const activeLease = MOCK_DATA.leases.find((l) => {
      const tId = typeof l.tenantId === "object" ? l.tenantId._id : l.tenantId;
      return tId === tenant?._id && l.status === "active";
    });
    return { tenant, activeLease: activeLease || null };
  }
  if (path.startsWith("/api/tenant/tickets") && method === "GET") {
    const params = new URLSearchParams(path.split("?")[1] || "");
    const tenantId = params.get("tenantId");
    const filtered = tenantId
      ? MOCK_DATA.tickets.filter((t) => {
          const tId = typeof t.tenantId === "object" ? t.tenantId._id : t.tenantId;
          return tId === tenantId;
        })
      : MOCK_DATA.tickets;
    return { tickets: filtered };
  }
  if (path === "/api/tenant/tickets" && method === "POST") {
    const body = JSON.parse(options.body || "{}");
    const newTicket = {
      _id: `tk${Date.now()}`,
      title: "Nuevo reporte de mantenimiento",
      description: body.description,
      category: "general", priority: "medium", status: "open",
      source: "dashboard", notes: "", communications: [],
      createdAt: new Date().toISOString(),
      tenantId: MOCK_DATA.tenants[0],
      propertyId: MOCK_DATA.properties[0],
      unitId: MOCK_DATA.units[0],
      leaseId: null,
    };
    MOCK_DATA.tickets.unshift(newTicket);
    return { ticket: newTicket };
  }

  return { ok: true, message: "Operación completada (mock)" };
}

// ─── Token y rol helpers ──────────────────────────────────────────────────────

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function setUserRole(role) {
  localStorage.setItem("role", role);
}

export function getUserRole() {
  return localStorage.getItem("role");
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

// ─── apiFetch — función principal ─────────────────────────────────────────────

export async function apiFetch(path, options = {}) {
  // Sin backend → mock
  if (!import.meta.env.VITE_API_URL) {
    return mockResponse(path, options);
  }

  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Error de servidor");
  return data;
}