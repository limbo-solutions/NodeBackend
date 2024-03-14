const mongoose = require("mongoose");

const transactiontableSchema = new mongoose.Schema({
  txnid: { type: String, required: true, unique: true },
  paymentgateway: { type: String, required: true },
  merchantTxnId: { type: String, required: true, unique: true },
  merchant: { type: String, required: true },
  orderNo: String,
  MID: String,
  cname: { type: String, required: true },
  email: String,
  cardnumber: { type: String, required: true },
  cardtype: { type: String, required: true },
  country: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  transactiondate: String,
  Status: {
    type: String,
    enum: ["Success", "Pending", "Failed"],
    default: "Pending",
  },
  message: { type: String, default: "Transaction is in process" },
  pdate: { type: Date },
  router: String,
  webURL: String,
});

const Transactiontable = mongoose.model(
  "Transactiontable",
  transactiontableSchema
);

module.exports = Transactiontable;
