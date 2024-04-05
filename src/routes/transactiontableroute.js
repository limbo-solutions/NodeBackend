const express = require("express");
const {
  createTransactiontable,
  getTransactiontable,
  quickSearch,
  successfulTransactions,
  statistics,
  successfulTransactionsForLast7Days,
  transactionCountsForLastNDays,
} = require("../controllers/transactiontablescontroller");

const router = express.Router();

// Define user routes
router.post("/transactiontables", createTransactiontable);
router.get("/transactiontables", getTransactiontable);
router.get("/transactiontables/quicksearch", quickSearch);
router.get("/transactiontables/successfultxnforday", successfulTransactions);
router.get("/transactiontables/statistics", statistics);
router.get(
  "/transactiontables/lastsevendays",
  successfulTransactionsForLast7Days
);
router.get("/transactiontables/linechart", transactionCountsForLastNDays);

module.exports = router;
