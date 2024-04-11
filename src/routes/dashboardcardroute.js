const express = require("express");
const {
  calculateSuccessPercentageController,
  calculateSuccessAmountController,
  calculateSuccessCountController,
  calculatePastSevenDaysController,
} = require("../controllers/dashboardcardscontroller");

const router = express.Router();

router.get("/dashboardcards/card1", calculateSuccessPercentageController);
router.get("/dashboardcards/card2", calculateSuccessAmountController);
router.get("/dashboardcards/card3", calculateSuccessCountController);
router.get("/dashboardcards/card4", calculatePastSevenDaysController);

module.exports = router;
