const express = require("express");
const {
  searchTransactionReport,
  quickSearch,
} = require("../controllers/reportscontroller");

const router = express.Router();

// Define user routes
router.post("/transactionreport", searchTransactionReport);
router.get("/transactionreport", quickSearch);

module.exports = router;
