const express = require("express");
const { signup, getUsers, updateUser, userDetails } = require("../controllers/userscontroller");

const router = express.Router();

// Define user routes
router.post("/signup", signup);
router.get("/signup", getUsers);
router.put("/updateUser", updateUser);
router.get("/userdetails", userDetails);

module.exports = router;
