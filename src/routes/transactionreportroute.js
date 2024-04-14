const express = require("express");
const {
  searchTransactionReport,
  quickSearch,
  multiTransactions,
  transactionsToday,
  transactionsYesterday,
  transactionsLast7Days,
  transactionsLast15Days,
  transactionsLast30Days,
  transactionsLastYear,
} = require("../controllers/reportscontroller");

const router = express.Router();

// Define user routes
router.post("/transactionreport", searchTransactionReport);
router.get("/transactionreport", quickSearch);
router.post("/multisearch", multiTransactions);
router.get("/reporttoday", transactionsToday);
router.get("/reportyesterday", transactionsYesterday);
router.get("/reportlast7days", transactionsLast7Days);
router.get("/reportlast15days", transactionsLast15Days);
router.get("/reportlast30days", transactionsLast30Days);
router.get("/reportlastyear", transactionsLastYear);

module.exports = router;
