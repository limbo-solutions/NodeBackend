const express = require("express");
const {
  createDocumenttype,
  getDocumenttype,
  searchDocumenttype,
  deleteDocumenttype,
  updateDocumenttype,    
} = require("../controllers/documenttypescontroller");

const router = express.Router();

router.post("/mastersettings/documenttype", createDocumenttype);
router.get("/mastersettings/documenttype", getDocumenttype);
router.post("/mastersettings/searchdocumenttype", searchDocumenttype);
router.delete("/mastersettings/deletedocumenttype", deleteDocumenttype);
router.put("/mastersettings/updatedocumenttype", updateDocumenttype);

module.exports = router;
