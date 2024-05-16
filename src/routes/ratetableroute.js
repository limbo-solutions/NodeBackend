const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createRatetable,
  getRatetable,
  getRates,
  updateRatetable
} = require("../controllers/ratetablescontroller");

const router = express.Router();

router.post("/ratetables", verifyToken, createRatetable);
router.get("/ratetables", verifyToken, getRatetable);
router.get("/getrates", verifyToken, getRates);
router.patch("/updateratetable", verifyToken, updateRatetable);

module.exports = router;
