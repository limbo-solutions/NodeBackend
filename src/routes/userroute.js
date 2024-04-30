const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  signup,
  getUsers,
  updateUser,
  userDetails,userShortcut, getUserShortcuts, deleteUserShortcuts
} = require("../controllers/userscontroller");

const router = express.Router();

// Define user routes
router.post("/signup", signup);
router.get("/signup", verifyToken, getUsers);
router.patch("/updateUser", verifyToken, updateUser);
router.get("/userdetails", verifyToken, userDetails);
router.post("/usershortcut", verifyToken, userShortcut)
router.get("/getshortcuts", verifyToken, getUserShortcuts);
router.delete("/deleteshortcut", verifyToken, deleteUserShortcuts);

module.exports = router;
