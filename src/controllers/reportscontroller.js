require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable")

async function searchTransactionReport(req, res) {
  try {
    const {
      searchIds,
      status,
      merchant,
      fromDate,
      toDate,
      mid,
      paymentgateway,
      currency,
      country,
      cardtype,
      cardnumber,
    } = req.body;

    const pipeline = [];

    if (fromDate && toDate) {
      pipeline.push({
        $match: {
          transactiondate: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      });
    }

    if (status) {
      pipeline.push({
        $match: {
          Status: status,
        },
      });
    }

    if (merchant) {
      pipeline.push({
        $match: {
          merchant: merchant,
        },
      });
    }

    if (mid) {
      pipeline.push({
        $match: {
          mid: mid,
        },
      });
    }

    if (paymentgateway) {
      pipeline.push({
        $match: {
          paymentgateway: paymentgateway,
        },
      });
    }

    if (currency) {
      pipeline.push({
        $match: {
          currency: currency,
        },
      });
    }

    if (country) {
      pipeline.push({
        $match: {
          country: country,
        },
      });
    }

    if (cardtype) {
      pipeline.push({
        $match: {
          cardtype: cardtype,
        },
      });
    }

    if (cardnumber) {
      pipeline.push({
        $match: {
          cardnumber: cardnumber,
        },
      });
    }

    if (searchIds) {
      pipeline.push({
        $match: {
          $or: [
            { txnid: { $in: searchIds.split(" ").filter(Boolean) }, },
            { merchantTxnId: { $in: searchIds.split(" ").filter(Boolean) }, },
          ],
          
        },
      });
    };

    const transactions = await LiveTransactionTable.aggregate(pipeline);

    res.json(transactions);
  } catch (error) {
    console.error("Error searching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function quickSearch(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Search value is required" });
  }

  try {
    const transaction = await LiveTransactionTable.findById(id);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  searchTransactionReport,
  quickSearch,
};
