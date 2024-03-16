const express = require("express");
const {
  createDocumentcategory,
  getDocumentcategory,
  searchDocumentcategory,
  deleteDocumentcategory,
  updateDocumentcategory,    
} = require("../controllers/documentcategoriescontroller");

const router = express.Router();

router.post("/mastersettings/documentcategory", createDocumentcategory);
router.get("/mastersettings/documentcategory", getDocumentcategory);
router.post("/mastersettings/searchdocumentcategory", searchDocumentcategory);
router.delete("/mastersettings/deletedocumentcategory", deleteDocumentcategory);
router.put("/mastersettings/updatedocumentcategory", updateDocumentcategory);

module.exports = router;
