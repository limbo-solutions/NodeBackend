const express = require("express");
const {
  createSettlement,
  getSettlement,
<<<<<<< HEAD
  updateSettlement
=======
  updateSettlement,
  getSettlementRecordforPDF,
>>>>>>> 51caf5f8106a5a1a6fd2e3672efd73eb2ff93cb6
} = require("../controllers/settlementscontroller");

const router = express.Router();

// Define user routes
router.post("/settlements", createSettlement);
router.get("/settlements", getSettlement);
router.put("/updatesettlements", updateSettlement);
<<<<<<< HEAD
=======
router.get("/getsettlementrecordforpdf", getSettlementRecordforPDF);
>>>>>>> 51caf5f8106a5a1a6fd2e3672efd73eb2ff93cb6

module.exports = router;
