const express = require("express");
const {
    createBusinesstype,
    getBusinesstype,
    searchBusinesstype,
    deleteBusinesstype,
    updateBusinesstype,
} = require("../controllers/businesstypescontroller");

const router = express.Router();

// Define user routes
router.post("/mastersettings/businesstypes", createBusinesstype);
router.get("/mastersettings/businesstypes", getBusinesstype);
router.post("/mastersettings/searchbusinesstypes", searchBusinesstype);
router.delete("/mastersettings/deletebusinesstypes", deleteBusinesstype);
router.put("/mastersettings/updatebusinesstypes", updateBusinesstype);

module.exports = router;
