const mongoose = require("mongoose");

const ratetableSchema = new mongoose.Schema({
  company_name: { type: String, required: true, unique: true },
  settlement_scheme: { type: String, required: true },
  MDR: { type: Number, required: true },
  txn_app: { type: Number },
  txn_dec: { type: Number },
  txn_total: { type: Number },
  RR: { type: Number },
  settlement_fee: { type: Number },
});

const Ratetable = mongoose.model("Ratetable", ratetableSchema);

module.exports = Ratetable;
