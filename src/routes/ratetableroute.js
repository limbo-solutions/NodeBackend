const express = require("express");
const {
  createRatetable,
  getRatetable,
} = require("../controllers/ratetablescontroller");

const router = express.Router();

// Define user routes
router.post("/ratetables", createRatetable);
router.get("/ratetables", getRatetable);

module.exports = router;
