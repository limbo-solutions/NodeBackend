const express = require("express");
const {
  createRatetable,
  getRatetable,
  getRates,
  updateRatetable
} = require("../controllers/ratetablescontroller");

const router = express.Router();

// Define user routes
router.post("/ratetables", createRatetable);
router.get("/ratetables", getRatetable);
router.get("/getrates", getRates);
router.post("/updateratetables", updateRatetable);

module.exports = router;
