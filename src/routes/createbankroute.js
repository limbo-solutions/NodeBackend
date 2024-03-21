const express = require("express");
const {
  createBank,
  getBank,
  searchBank,
  deleteBank,
  updateBank,
} = require("../controllers/createbankscontroller");

const router = express.Router();

router.post("/mastersettings/bank", createBank);
router.get("/mastersettings/bank", getBank);
router.post("/mastersettings/searchbank", searchBank);
router.delete("/mastersettings/deletebank", deleteBank);
router.put("/mastersettings/updatebank", updateBank);

module.exports = router;
