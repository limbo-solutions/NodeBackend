const express = require("express");
const {
  createSettlement,
  getSettlement,
  updateSettlement,
  getSettlementRecordforPDF,
  listSettlement,
} = require("../controllers/settlementscontroller");

const router = express.Router();

router.post("/settlements", createSettlement);
router.get("/settlements", getSettlement);
router.put("/updatesettlements", updateSettlement);
router.get("/getsettlementrecordforpdf", getSettlementRecordforPDF);
router.get("/listsettlement", listSettlement);

module.exports = router;
