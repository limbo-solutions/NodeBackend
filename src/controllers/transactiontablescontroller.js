require("../config/database");
const Transactiontable = require("../models/Transactiontable");

async function createTransactiontable(req, res) {
  try {
    const {
      txnid,
      paymentgateway,
      merchantTxnId,
      merchant,
      orderNo,
      MID,
      cname,
      email,
      cardnumber,
      cardtype,
      country,
      amount,
      currency,
      Status,
      message,
      pdate,
      router,
      webURL,
    } = req.body;

    const transactionDate = new Date();

    // Format the transaction date as dd/mm/yyyy hh:mm:ss
    const formattedTransactionDate = `${("0" + transactionDate.getDate()).slice(
      -2
    )}/${("0" + (transactionDate.getMonth() + 1)).slice(
      -2
    )}/${transactionDate.getFullYear()} ${(
      "0" + transactionDate.getHours()
    ).slice(-2)}:${("0" + transactionDate.getMinutes()).slice(-2)}:${(
      "0" + transactionDate.getSeconds()
    ).slice(-2)}`;

    // Create a new Transactiontable
    const transactiontable = new Transactiontable({
      txnid,
      paymentgateway,
      merchantTxnId,
      merchant,
      orderNo,
      MID,
      cname,
      email,
      cardnumber,
      cardtype,
      country,
      amount,
      currency,
      transactiondate: formattedTransactionDate,
      Status,
      message,
      pdate,
      router,
      webURL,
    });

    // Save the Transactiontable to the database
    await transactiontable.save();

    res.status(201).json({
      message: "Transactiontable created successfully",
      transactiontable: transactiontable,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getTransactiontable(req, res) {
  try {
    const transactiontable = await Transactiontable.find();
    res.status(200).json(transactiontable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createTransactiontable, getTransactiontable };
