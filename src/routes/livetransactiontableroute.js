const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");

const {
  getLivedata, 
  searchTransactions
} = require("../controllers/livetransactiontablecontroller");

const router = express.Router();

router.get("/getlivedata", getLivedata);
router.get("/searchtxn", searchTransactions);


module.exports = router;
