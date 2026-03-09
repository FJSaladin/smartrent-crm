const express = require("express");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");

const {
  createTenant,
  listTenants,
  getTenant,
  updateTenant,
  deleteTenant,
  linkTenantToUser
} = require("../controllers/tenantController");

const router = express.Router();

// todas las rutas requieren autenticación
router.use(auth);

// solo landlords pueden gestionar tenants
router.use(requireRole("landlord"));

router.post("/", createTenant);
router.get("/", listTenants);
router.get("/:id", getTenant);
router.put("/:id", updateTenant);
router.delete("/:id", deleteTenant);

// nueva ruta para conectar user con tenant
router.patch("/:id/link-user", linkTenantToUser);

module.exports = router;