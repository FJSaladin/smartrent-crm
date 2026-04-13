const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Usuario de prueba para desarrollo sin backend
const MOCK_USER = {
  id: "mock-001",
  name: "Fausto",
  email: "fausto@smartrent.com",
  role: "landlord",
  isActive: true,
  emailVerified: true,
};

// Datos de prueba
const MOCK_DATA = {
  properties: [
    { _id: "p1", name: "Torre Norte", address: "Santo Domingo, RD", status: "active", notes: "Edificio principal" },
    { _id: "p2", name: "Residencial Sur", address: "Santiago, RD", status: "active", notes: "" },
  ],
  tenants: [
    { _id: "t1", fullName: "María García", email: "maria@correo.com", phone: "809-000-0001", status: "active", notes: "" },
    { _id: "t2", fullName: "Juan Pérez", email: "juan@correo.com", phone: "809-000-0002", status: "active", notes: "" },
  ],
  units: [
    { _id: "u1", propertyId: "p1", unitNumber: "1A", bedrooms: 2, bathrooms: 1, rent: 15000, status: "occupied", notes: "" },
    { _id: "u2", propertyId: "p1", unitNumber: "2B", bedrooms: 3, bathrooms: 2, rent: 20000, status: "vacant", notes: "" },
    { _id: "u3", propertyId: "p2", unitNumber: "1A", bedrooms: 1, bathrooms: 1, rent: 10000, status: "vacant", notes: "" },
  ],
  leases: [
    {
      _id: "l1",
      propertyId: { _id: "p1", name: "Torre Norte", address: "Santo Domingo, RD" },
      unitId: { _id: "u1", unitNumber: "1A", rent: 15000, status: "occupied" },
      tenantId: { _id: "t1", fullName: "María García", email: "maria@correo.com", phone: "809-000-0001" },
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      monthlyRent: 15000,
      deposit: 30000,
      dueDay: 1,
      status: "active",
      notes: "",
    },
  ],
  tickets: [
    {
      _id: "tk1",
      title: "Fuga de agua en baño",
      description: "Hay una fuga en la llave del baño principal",
      category: "plumbing",
      priority: "high",
      status: "open",
      source: "whatsapp",
      notes: "Revisar con plomero",
      communications: [],
      createdAt: new Date().toISOString(),
      tenantId: { _id: "t1", fullName: "María García", email: "maria@correo.com", phone: "809-000-0001" },
      propertyId: { _id: "p1", name: "Torre Norte", address: "Santo Domingo, RD" },
      unitId: { _id: "u1", unitNumber: "1A" },
      leaseId: { _id: "l1", monthlyRent: 15000, status: "active" },
    },
    {
      _id: "tk2",
      title: "Aire acondicionado no enfría",
      description: "El AC de la sala no está funcionando correctamente",
      category: "hvac",
      priority: "medium",
      status: "in_progress",
      source: "dashboard",
      notes: "",
      communications: [
        { channel: "email", message: "Técnico visitará el martes", sentAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
      tenantId: { _id: "t2", fullName: "Juan Pérez", email: "juan@correo.com", phone: "809-000-0002" },
      propertyId: { _id: "p2", name: "Residencial Sur", address: "Santiago, RD" },
      unitId: { _id: "u3", unitNumber: "1A" },
      leaseId: null,
    },
  ],
};

// Interceptor mock
function mockResponse(path, options = {}) {
  const method = options.method || "GET";

  // AUTH
  if (path === "/api/auth/me") return { user: MOCK_USER };
  if (path === "/api/auth/login") return { token: "mock-token", user: MOCK_USER };

  // PROPERTIES
  if (path === "/api/properties" && method === "GET") return { properties: MOCK_DATA.properties };
  if (path.match(/\/api\/properties\/\w+$/) && method === "GET") {
    const id = path.split("/").pop();
    return { property: MOCK_DATA.properties.find(p => p._id === id) };
  }

  // UNITS
  if (path.match(/\/api\/properties\/\w+\/units/) && method === "GET") {
    const propertyId = path.split("/")[3];
    return { units: MOCK_DATA.units.filter(u => u.propertyId === propertyId) };
  }

  // TENANTS
  if (path === "/api/tenants" && method === "GET") return { tenants: MOCK_DATA.tenants };

  // LEASES
  if (path === "/api/leases" && method === "GET") return { leases: MOCK_DATA.leases };

  // TICKETS
  if (path === "/api/tickets" && method === "GET") return { tickets: MOCK_DATA.tickets };

  // Para cualquier otra cosa devuelve éxito genérico
  return { ok: true };
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

export async function apiFetch(path, options = {}) {
  // Si no hay backend, usamos mock
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