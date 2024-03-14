const express = require("express");
const { createClient, getClient } = require("../controllers/clientscontroller");

const router = express.Router();

// Define user routes
router.post("/clients", createClient);
router.get("/clients", getClient);

module.exports = router;
