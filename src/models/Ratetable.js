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
  currency: { type: String },
  setup_fee: { type: Number },
  settlement_cycle: { type: String },
  annual_maintenance_fee: { type: Number }, 
  RR_remark: { type: String },
  setupFee_remark: { type: String },
  settlementFee_remark: { type: String },
  annualMaintenanceFee_remark: { type: String },
});

const Ratetable = mongoose.model("Ratetable", ratetableSchema);

module.exports = Ratetable;
