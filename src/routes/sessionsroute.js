const express = require("express");
const login = require("../controllers/sessionscontroller");

const router = express.Router();

// Define user routes
router.post("/login", login);

module.exports = router;
