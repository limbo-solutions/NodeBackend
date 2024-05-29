const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");

const {
  getLivedata, 
  searchTransactions,
  getLatestTransactions
} = require("../controllers/livetransactiontablecontroller");
const {
  countriesList,
  midList,
} = require("../controllers/utilitycontroller");

const router = express.Router();

router.get("/getlivedata", getLivedata);
router.get("/searchtxn", searchTransactions);
router.get("/latest100", getLatestTransactions);
router.get("/listofcountries", countriesList);
router.get("/listofmids", midList);

module.exports = router;
