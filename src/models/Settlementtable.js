const mongoose = require("mongoose");

const settlementtableSchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  total_volume: { type: Number },
  settlement_volume: { type: Number },
  date_settled: { type: String },
  status: { type: String, default: "Pending" },
});

const Settlementtable = mongoose.model(
  "Settlementtable",
  settlementtableSchema
);

module.exports = Settlementtable;
