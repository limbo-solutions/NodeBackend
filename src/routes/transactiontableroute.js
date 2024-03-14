const express = require("express");
const {
  createTransactiontable,
  getTransactiontable,
} = require("../controllers/transactiontablescontroller");

const router = express.Router();

// Define user routes
router.post("/transactiontables", createTransactiontable);
router.get("/transactiontables", getTransactiontable);

module.exports = router;
