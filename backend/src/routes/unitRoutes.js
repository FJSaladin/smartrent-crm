const express = require("express");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");
const {
  createUnit,
  listUnitsByProperty,
  updateUnit,
  deleteUnit,
} = require("../controllers/unitController");

const router = express.Router();

// Todas protegidas
router.use(auth);
router.use(requireRole("landlord"));

// nested routes bajo property
router.post("/properties/:propertyId/units", createUnit);
router.get("/properties/:propertyId/units", listUnitsByProperty);

// direct routes por unitId
router.put("/units/:id", updateUnit);
router.delete("/units/:id", deleteUnit);

module.exports = router;