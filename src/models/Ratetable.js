const mongoose = require("mongoose");

const ratetableSchema = new mongoose.Schema({
  company_name: { type: String, required: true, unique: true },
  MDR: { type: Number, required: true },
  txn_app: { type: Number },
  txn_dec: { type: Number },
  RR: { type: Number },
  settlement_fee: { type: Number },
  refund_fee: { type: Number },
  chargeback_fee: { type: Number },
});

const Ratetable = mongoose.model("Ratetable", ratetableSchema);

module.exports = Ratetable;
