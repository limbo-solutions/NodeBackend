const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");

const { createClient, getClient, viewClient, updateClient } = require("../controllers/clientscontroller");
const router = express.Router();

// Define user routes
router.post("/clients", verifyToken, createClient);
router.get("/clients", verifyToken, getClient);
router.get("/viewclient",  viewClient);
router.patch("/updateclient", verifyToken, updateClient);

module.exports = router;
