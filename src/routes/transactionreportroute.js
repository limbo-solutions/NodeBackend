const express = require("express");
const { searchTransactionReport } = require("../controllers/reportscontroller");

const router = express.Router();

// Define user routes
router.post("/transactionreport", searchTransactionReport);

module.exports = router;
