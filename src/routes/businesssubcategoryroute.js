const express = require("express");
const {
  createBusinesssubcategory,
  getBusinesssubcategory,
  searchBusinesssubcategory,
  deleteBusinesssubcategory,
  updateBusinesssubcategory,    
} = require("../controllers/businesssubcategoriescontroller");

const router = express.Router();

router.post("/mastersettings/businesssubcategory", createBusinesssubcategory);
router.get("/mastersettings/businesssubcategory", getBusinesssubcategory);
router.post("/mastersettings/searchbusinesssubcategory", searchBusinesssubcategory);
router.delete("/mastersettings/deletebusinesssubcategory", deleteBusinesssubcategory);
router.put("/mastersettings/updatebusinesssubcategory", updateBusinesssubcategory);

module.exports = router;
