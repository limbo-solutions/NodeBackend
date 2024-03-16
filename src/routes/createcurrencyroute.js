const express = require("express");
const {
  createCurrency,
  getCurrency,
  searchCurrency,
  deleteCurrency,
  updateCurrency,    
} = require("../controllers/currenciescontroller");

const router = express.Router();

router.post("/mastersettings/currency", createCurrency);
router.get("/mastersettings/currency", getCurrency);
router.post("/mastersettings/searchcurrency", searchCurrency);
router.delete("/mastersettings/deletecurrency", deleteCurrency);
router.put("/mastersettings/updatecurrency", updateCurrency);

module.exports = router;
