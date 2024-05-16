const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");

const { createClient, getClient, updateClient } = require("../controllers/clientscontroller");

const router = express.Router();

// Define user routes
router.post("/clients", verifyToken, createClient);
router.get("/clients", verifyToken, getClient);
router.patch("/updateclient", verifyToken, updateClient);

module.exports = router;
