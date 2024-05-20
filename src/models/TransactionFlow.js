const mongoose = require("mongoose");

const TransactionFlowSchema = new mongoose.Schema({
    // ---------- DETAILS FROM MERCHANT SIDE -----------------

    //unique id for each merchant to identify it
    merchantID: {type: String, required: true},    
    
    // unique id for txn that we will get from the merchant
    merchantTxnID: {type: String, required: true, unique: true},

    //customer details 
    name: {type: String},
    email: {type: String},

    // payment details
    amount: {type: Number, required: true},
    currency: {type: String, required: true},
    cardnumber: {type: String, required: true},
    cardExpire: {type: String, required: true},
    cardCVV: {type: String, required: true},

    // -------------- DETAILS ADDED FROM CENTPAYS SIDE --------------

    token: {type: String},
    transactiondate: {type: Date, required: true},
    country: {type: String},
    cardtype: {type: String},
    // unique id sent as token to merchant to check status and send to acquirer, response from acquirer will be updated using this field
    txnId: {type: String, required: true},

    // status and message returned from acquirer side
    status: {type: String, default: "Pending"},
    message: {type: String, default: "Transaction is being processed"},
});

const TransactionFlow = mongoose.model("TransactionFlow", TransactionFlowSchema);

module.exports = TransactionFlow;