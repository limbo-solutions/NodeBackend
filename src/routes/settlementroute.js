const express = require("express");
const {
  createSettlement,
  getSettlement,
  updateSettlement,
  getSettlementRecordforPDF,
} = require("../controllers/settlementscontroller");

const router = express.Router();

// Define user routes
router.post("/settlements", createSettlement);
router.get("/settlements", getSettlement);
router.put("/updatesettlements", updateSettlement);
router.get("/getsettlementrecordforpdf", getSettlementRecordforPDF);

module.exports = router;
