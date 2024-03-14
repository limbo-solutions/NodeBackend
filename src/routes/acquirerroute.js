const express = require("express");
const {
  createAcquirer,
  getAcquirer,
} = require("../controllers/acquirerscontroller");

const router = express.Router();

// Define user routes
router.post("/acquirers", createAcquirer);
router.get("/acquirers", getAcquirer);

module.exports = router;
