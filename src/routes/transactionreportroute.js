const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  searchTransactionReport,
  quickSearch,
} = require("../controllers/reportscontroller");

const router = express.Router();

router.post("/transactionreport", verifyToken, searchTransactionReport);
router.get("/transactionreport", verifyToken, quickSearch);

module.exports = router;
