const mongoose = require("mongoose");

const settlementtableSchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  fromDate: { type: String },
  toDate: { type: String },
  eur_sales_count: { type: Number },
  eur_declines_count: { type: Number },
  usd_sales_count: { type: Number },
  usd_declines_count: { type: Number },
  total_sales_count: { type: Number },
  total_declines_count: { type: Number },
  total_sales_amount: { type: Number },
  total_declines_amount: { type: Number },
  MDR_amount: { type: Number },
  app_amount: { type: Number },
  dec_amount: { type: Number },
  RR_amount: { type: Number },
  s_val: { type: Number },
  total_fee: { type: Number },
  settlement_volume: { type: Number },
  refund_amount: { type: Number },
  chargeback_amount: { type: Number },
  date_settled: { type: String },
  status: { type: String, default: "Pending" },
});

const Settlementtable = mongoose.model(
  "Settlementtable",
  settlementtableSchema
);

module.exports = Settlementtable;
