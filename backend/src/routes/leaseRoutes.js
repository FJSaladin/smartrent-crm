const express = require("express");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");
const {
  createLease,
  listLeases,
  getLease,
  updateLease,
  deleteLease,
} = require("../controllers/leaseController");

const router = express.Router();

router.use(auth);
router.use(requireRole("landlord"));

router.post("/", createLease);
router.get("/", listLeases);
router.get("/:id", getLease);
router.put("/:id", updateLease);
router.delete("/:id", deleteLease);

module.exports = router;