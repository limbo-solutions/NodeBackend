require("../config/database");
const Transactiontable = require("../models/Transactiontable");

async function searchTransactionReport(req, res) {
  try {
    const {
      txnid,
      merchantTxnId,
      orderNo,
      Status,
      fromDate,
      toDate,
      merchant,
      MID,
      paymentgateway,
      currency,
      country,
      cardtype,
      cardnumber,
    } = req.body;

    // const transactiondate = { $gte: fromDateWithTime, $lte: toDateWithTime };
    const searchCriteria = {};

    if (txnid !== undefined) {
      searchCriteria.txnid = {
        $regex: new RegExp(`^${txnid}$`),
      };
    }
    if (merchantTxnId !== undefined) {
      searchCriteria.merchantTxnId = {
        $regex: new RegExp(`^${merchantTxnId}$`),
      };
    }
    if (orderNo !== undefined) {
      searchCriteria.orderNo = {
        $regex: new RegExp(`^${orderNo}$`),
      };
    }

    if (Status !== undefined) {
      searchCriteria.Status = { $regex: new RegExp(`^${Status}$`, "i") };
    }

    if (fromDate !== undefined && toDate !== undefined) {
      const fromDateWithTime = fromDate + " 00:00:00";
      const toDateWithTime = toDate + " 23:59:59";
      searchCriteria.transactiondate = {
        $gte: fromDateWithTime,
        $lte: toDateWithTime,
      };
    }

    if (merchant !== undefined) {
      searchCriteria.merchant = {
        $regex: new RegExp(`^${merchant}$`, "i"),
      };
    }
    if (MID !== undefined) {
      searchCriteria.MID = {
        $regex: new RegExp(`^${MID}$`),
      };
    }
    if (paymentgateway !== undefined) {
      searchCriteria.paymentgateway = {
        $regex: new RegExp(`^${paymentgateway}$`, "i"),
      };
    }
    if (currency !== undefined) {
      searchCriteria.currency = {
        $regex: new RegExp(`^${currency}$`, "i"),
      };
    }
    if (country !== undefined) {
      searchCriteria.country = {
        $regex: new RegExp(`^${country}$`, "i"),
      };
    }
    if (cardtype !== undefined) {
      searchCriteria.cardtype = {
        $regex: new RegExp(`^${cardtype}$`, "i"),
      };
    }
    if (cardnumber !== undefined) {
      searchCriteria.cardnumber = {
        $regex: new RegExp(`^${cardnumber}$`, "i"),
      };
    }

    const foundRecords = await Transactiontable.find(searchCriteria);

    if (foundRecords.length > 0) {
      return res.status(200).json({
        records: foundRecords,
      });
    } else {
      return res.status(404).json({ message: "Records not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function quickSearch(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Search value is required" });
  }

  try {
    const transaction = await Transactiontable.findById(id);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { searchTransactionReport, quickSearch };
