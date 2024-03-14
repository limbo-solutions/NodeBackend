const express = require("express");
const { signup, getUsers } = require("../controllers/userscontroller");

const router = express.Router();

// Define user routes
router.post("/signup", signup);
router.get("/signup", getUsers);

module.exports = router;
