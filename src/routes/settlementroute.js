const express = require("express");
const {
  createSettlement,
  getSettlement,
  updateSettlement
} = require("../controllers/settlementscontroller");

const router = express.Router();

// Define user routes
router.post("/settlements", createSettlement);
router.get("/settlements", getSettlement);
router.put("/updatesettlements", updateSettlement);

module.exports = router;
