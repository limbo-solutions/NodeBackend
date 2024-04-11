const express = require("express");
const {
    calculateSuccessPercentage,
    calculateSuccessAmount,
    calculateSuccessCount,
    calculatePastSevenDays,
    calculateTransactionAmounts,
    calculateTransactionCounts,
    calculateTransactionComparison,
    calculateCountryTransactionStats,
    calculateWeeklySuccessPercentage,
    calculateLast30DaysMetrics,
    calculateLast6MonthsSales
} = require("../controllers/dashboardcardscontroller");

const router = express.Router();

router.get("/dashboardcards/card1", calculateSuccessPercentage);
router.get("/dashboardcards/card2", calculateSuccessAmount);
router.get("/dashboardcards/card3", calculateSuccessCount);
router.get("/dashboardcards/card4", calculatePastSevenDays);
router.get("/dashboardcards/card5", calculateTransactionAmounts);
router.get("/dashboardcards/card6", calculateTransactionCounts);
router.get("/dashboardcards/card7", calculateTransactionComparison);
router.get("/dashboardcards/card8", calculateCountryTransactionStats);
router.get("/dashboardcards/card9", calculateWeeklySuccessPercentage);
router.get("/dashboardcards/card10", calculateLast30DaysMetrics);
router.get("/dashboardcards/card11", calculateLast6MonthsSales);
module.exports = router;
