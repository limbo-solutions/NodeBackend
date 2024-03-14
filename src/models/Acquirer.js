const mongoose = require("mongoose");

const acquirerSchema = new mongoose.Schema({
  acquirer_name: { type: String, required: true, unique: true },
  acquirer_email: { type: String, required: true, unique: true },
  website_url: { type: String, required: true },
  city: String,
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
});

const Acquirer = mongoose.model("Acquirer", acquirerSchema);

module.exports = Acquirer;
