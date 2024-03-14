const bcrypt = require("bcrypt");
const User = require("../models/User");

// Controller for user signup
async function signup(req, res) {
  try {
    const {
      name,
      email,
      mobile_no,
      country,
      role,
      password,
      confirm_password,
      company_name,
    } = req.body;

    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ message: "Password and confirm password do not match" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      mobile_no,
      country,
      role,
      password: hashedPassword,
      company_name,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User created successfully", user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUsers(req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { signup, getUsers };
