const express = require("express");
const {
  createCategory,
  getCategory,
  searchCategory,
  deleteCategory,
  updateCategory,    
} = require("../controllers/categoriescontroller");

const router = express.Router();

// Define user routes
router.post("/mastersettings/category", createCategory);
router.get("/mastersettings/category", getCategory);
router.post("/mastersettings/searchcategory", searchCategory);
router.delete("/mastersettings/deletecategory", deleteCategory);
router.put("/mastersettings/updatecategory", updateCategory);

module.exports = router;
