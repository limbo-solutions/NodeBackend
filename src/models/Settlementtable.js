const mongoose = require("mongoose");

const settlementtableSchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  fromDate: { type: String },
  toDate: { type: String },
  eur_app_count: { type: Number },
  eur_dec_count: { type: Number },
  usd_app_count: { type: Number },
  usd_dec_count: { type: Number },
  eur_app_vol: { type: Number },
  eur_dec_vol: { type: Number },
  usd_app_vol: { type: Number },
  usd_dec_vol: { type: Number },
  eur_MDR_amount: { type: Number },
  eur_app_amount: { type: Number },
  eur_dec_amount: { type: Number },
  eur_RR_amount: { type: Number },
  usd_MDR_amount: { type: Number },
  usd_app_amount: { type: Number },
  usd_dec_amount: { type: Number },
  usd_RR_amount: { type: Number },
  eur_settlement_fee_amount: { type: Number },
  usd_settlement_fee_amount: { type: Number },
  eur_settlement_amount: { type: Number },
  usd_settlement_amount: { type: Number },
  eur_no_of_refund: { type: Number },
  eur_refund_amount: { type: Number },
  eur_total_refund_amount: { type: Number },
  eur_no_of_chargeback: { type: Number },
  eur_chargeback_amount: { type: Number },
  eur_total_chargeback_amount: { type: Number },
  usd_no_of_refund: { type: Number },
  usd_refund_amount: { type: Number },
  usd_total_refund_amount: { type: Number },
  usd_no_of_chargeback: { type: Number },
  usd_chargeback_amount: { type: Number },
  usd_total_chargeback_amount: { type: Number },
  eur_settlement_vol: { type: Number },
  eur_to_usd_settlement_vol: { type: Number },
  usd_settlement_vol: { type: Number },
  date_settled: { type: String },
  status: { type: String, default: "Pending" },
});

const Settlementtable = mongoose.model(
  "Settlementtable",
  settlementtableSchema
);

module.exports = Settlementtable;
