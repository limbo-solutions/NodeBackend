const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  company_name: { type: String, required: true, unique: true },
  company_type: { type: String, required: true },
  website_url: { type: String },
  company_email: { type: String, required: true, unique: true },
  city: String,
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  acquirer_name: String,
  last_settled_date: { type: Date },
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
