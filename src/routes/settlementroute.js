const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/verifyToken");

const {
  createSettlement,
  previewSettlement,
  getSettlement,
  updateSettlement,
  getSettlementRecordforPDF,
  sendEmail,
  getCounts,
  deleteSettlement,semimanualSettlements,
  manualSettlements,
  createDailySettlementExcel
} = require("../controllers/settlementscontroller");

const router = express.Router();
const upload = multer();

router.post("/settlements", verifyToken, createSettlement);
router.post("/previewsettlement", verifyToken, previewSettlement);
router.get("/settlements", verifyToken, getSettlement);
router.patch("/updatesettlements", verifyToken, updateSettlement);
router.get("/getsettlementrecordforpdf", verifyToken, getSettlementRecordforPDF);
router.post("/sendemail", upload.single("attachment"), verifyToken, sendEmail);
router.get("/settlements/counts", verifyToken, getCounts);
router.delete("/deletesettlementrecord", verifyToken, deleteSettlement);
router.post("/manualsettlements", verifyToken, manualSettlements);
router.post("/semimanualsettlements", verifyToken, semimanualSettlements);
router.post("/dailySettlement", verifyToken, createDailySettlementExcel);

module.exports = router;
