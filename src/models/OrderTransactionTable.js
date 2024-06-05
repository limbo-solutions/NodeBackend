const mongoose = require("mongoose");

const OrderTransactionTableSchema = new mongoose.Schema({
    
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
    status: {type: String, default: "Pending"},
    message: {type: String, default: "Transaction is being processed"},
});

const OrderTransactionTable = mongoose.model("OrderTransactionTable", OrderTransactionTableSchema);

module.exports = OrderTransactionTable;