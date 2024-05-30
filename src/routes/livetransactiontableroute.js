const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");

const {
  getLivedata, 
  searchTransactions,
  getLatestTransactions,
} = require("../controllers/livetransactiontablecontroller");


const router = express.Router();

router.get("/getlivedata", getLivedata);
router.get("/searchtxn", searchTransactions);
router.get("/latest100", getLatestTransactions);

module.exports = router;
