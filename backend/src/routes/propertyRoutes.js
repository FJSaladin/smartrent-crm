const express = require("express");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");
const {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const router = express.Router();

router.use(auth);
router.use(requireRole("landlord")); // solo landlords manejan propiedades

router.post("/", createProperty);
router.get("/", listProperties);
router.get("/:id", getProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

module.exports = router;