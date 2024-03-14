const express = require("express");
const {
  createSettlement,
  getSettlement,
} = require("../controllers/settlementscontroller");

const router = express.Router();

// Define user routes
router.post("/settlements", createSettlement);
router.get("/settlements", getSettlement);

module.exports = router;
