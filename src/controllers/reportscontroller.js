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

async function multiTransactions(req, res) {
  try {
    const txnids = req.body.txnids.split(" ").filter(Boolean);

    const transactions = await Transactiontable.find({
      txnid: { $in: txnids },
    });

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function transactionsToday(req, res) {
  try {
    const today = new Date();

    const fromDate = `${("0" + today.getDate()).slice(-2)}/${(
      "0" +
      (today.getMonth() + 1)
    ).slice(-2)}/${today.getFullYear()} 00:00:00`;
    const toDate = `${("0" + today.getDate()).slice(-2)}/${(
      "0" +
      (today.getMonth() + 1)
    ).slice(-2)}/${today.getFullYear()} 23:59:59`;

    const transactions = await Transactiontable.find({
      transactiondate: {
        $gte: fromDate,
        $lte: toDate,
      },
    });

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function transactionsYesterday(req, res) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const fromDate = `${("0" + yesterday.getDate()).slice(-2)}/${(
      "0" +
      (yesterday.getMonth() + 1)
    ).slice(-2)}/${yesterday.getFullYear()} 00:00:00`;
    const toDate = `${("0" + yesterday.getDate()).slice(-2)}/${(
      "0" +
      (yesterday.getMonth() + 1)
    ).slice(-2)}/${yesterday.getFullYear()} 23:59:59`;

    const transactions = await Transactiontable.find({
      transactiondate: {
        $gte: fromDate,
        $lte: toDate,
      },
    });

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const transactionsLast7Days = async (req, res) => {
  try {
    const transactions = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const transaction = await Transactiontable.find({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
      });

      if (transaction.length > 0) {
        transactions.push(...transaction);
      }
    }
    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function transactionsLast15Days(req, res) {
  try {
    const transactions = [];

    for (let i = 0; i < 15; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const transaction = await Transactiontable.find({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
      });

      if (transaction.length > 0) {
        transactions.push(...transaction);
      }
    }
    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function transactionsLast30Days(req, res) {
  try {
    const transactions = [];

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      console.log(fromDate);
      console.log(toDate);

      const transaction = await Transactiontable.find({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
      });

      console.log(transaction);

      if (transaction.length > 0) {
        transactions.push(...transaction);
      }
    }
    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function transactionsLastYear(req, res) {
  try {
    const transactions = [];

    for (let i = 0; i < 365; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const transaction = await Transactiontable.find({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
      });

      if (transaction.length > 0) {
        transactions.push(...transaction);
      }
    }
    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  searchTransactionReport,
  quickSearch,
  multiTransactions,
  transactionsToday,
  transactionsYesterday,
  transactionsLast7Days,
  transactionsLast15Days,
  transactionsLast30Days,
  transactionsLastYear,
};
