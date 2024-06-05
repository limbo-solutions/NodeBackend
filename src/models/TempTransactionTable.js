const mongoose = require("mongoose");

const TempTransactionTableSchema = new mongoose.Schema({
    
    merchantID: {type: String, required: true},    
    merchantTxnID: {type: String, required: true, unique: true},
    orderNo: {type: String},
    name: {type: String},
    email: {type: String},
    phone: {type: String},
    amount: {type: String, required: true},
    currency: {type: String, required: true},
    cardnumber: {type: String, required: true},
    cardExpire: {type: String, required: true},
    cardCVV: {type: String, required: true},
    backURL: {type: String},
    requestMode: {type: String},
    token: {type: String},
    transactiondate: {type: Date, required: true},
    country: {type: String},
    cardtype: {type: String},
    txnId: {type: String, required: true},
    status: {type: String, default: "In Progress"},
    message: {type: String, default: "Transaction is in process"},

});

const TempTransactionTable = mongoose.model("TempTransactionTable", TempTransactionTableSchema);

module.exports = TempTransactionTable;