const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
 ApprovalRatioChart
} = require("../controllers/utilitycontroller");

const router = express.Router();

// Define user routes
router.get("/approval-ratios-chart", ApprovalRatioChart);

module.exports = router;