const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  mobile_no: String,
  country: String,
  role: { type: String, default: "user" },
  password: { type: String, required: true },
  company_name: {
    type: String,
    ref: "Client", // Reference to the Client model
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
