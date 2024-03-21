const express = require("express");
const {
  login,
  updateUser,
  userDetails,
} = require("../controllers/sessionscontroller");

const router = express.Router();

// Define user routes
router.post("/login", login);
router.put("/updateuser", updateUser);
router.get("/userdetails", userDetails);

module.exports = router;
