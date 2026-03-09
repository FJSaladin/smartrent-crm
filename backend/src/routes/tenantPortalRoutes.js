const express = require("express");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");
const { getMyTenantProfile } = require("../controllers/tenantController");

const router = express.Router();

router.get("/tenant/me", auth, requireRole("tenant"), getMyTenantProfile);

module.exports = router;