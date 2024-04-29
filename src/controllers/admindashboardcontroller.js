require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");

const AdminsuccessPercentageToday = async (req, res) => {
  const { currency, merchant } = req.query;
  console.log("merchat", merchant);
  try {
    const currentDate = new Date();
    const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
    const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;
console.log(fromDate)
console.log
    const query = {
      transactiondate: { $gte: fromDate, $lte: toDate },
      currency: currency,
    };

    if (merchant) {
      query.merchant = merchant;
    }

    const aggregationPipeline = [
      {
        $match: query,
      },
      {
        $group: {
          _id: "$Status",
          count: { $sum: 1 },
          totalAmount: { $sum: { $cond: [{ $eq: ["$Status", "Success"] }, "$amount", 0] } }
        }
      }
    ];

    const resultsForDay = await LiveTransactionTable.aggregate(aggregationPipeline);

    const successResult = resultsForDay.find(result => result._id === "Success") || { count: 0, totalAmount: 0 };
    const failedResult = resultsForDay.find(result => result._id === "Failed") || { count: 0 };
    const incompleteResult = resultsForDay.find(result => result._id === "Incompleted") || { count: 0 };

    const successCount = successResult.count;
    const failedCount = failedResult.count;
    const incompleteCount = incompleteResult.count;

    const successAmount = successResult.totalAmount;

    const totalTransactions = successCount + failedCount + incompleteCount;

    const successPercentage = totalTransactions === 0 ? 0 : (successCount / totalTransactions) * 100;

    res.status(200).json({
      successPercentage: successPercentage.toFixed(2),
      successAmount: successAmount.toFixed(3),
      totalTransactions,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const AdminweeklyStats = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    const currentDate = new Date();
    const results = [];
    const transactionCounts = [];
    let successThisWeek = 0;
    let failedThisWeek = 0;
    let incompleteThisWeek=0;
    let currentWeekSuccessTotalCount = 0
    let totalNumTxn = 0;

    const oneDayMilliseconds = 24 * 60 * 60 * 1000; 

    for (let i = 0; i < 7; i++) {
  const dayDate = new Date(currentDate.getTime() - i * oneDayMilliseconds);

  const fromDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
  const toDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59);

  const formattedFromDate = `${("0" + fromDate.getDate()).slice(-2)}/${("0" + (fromDate.getMonth() + 1)).slice(-2)}/${fromDate.getFullYear()} 00:00:00`;
  const formattedToDate = `${("0" + toDate.getDate()).slice(-2)}/${("0" + (toDate.getMonth() + 1)).slice(-2)}/${toDate.getFullYear()} 23:59:59`;

      const query = {
        transactiondate: { $gte: formattedFromDate, $lte: formattedToDate },
        currency: currency
      };
      if (merchant) {
        query.merchant = merchant;
      }

      const aggregationPipeline = [
        { $match: query },
        {$group: { 
          _id: "$Status", 
          count: { $sum: 1 }, 
          totalAmount: { $sum: "$amount" } 
        } }
      ];

      const resultsForDay = await LiveTransactionTable.aggregate(aggregationPipeline);
      
      const successResult = resultsForDay.find(result => result._id === "Success");
      const failedResult = resultsForDay.find(result => result._id === "Failed");
      const incompleteResult = resultsForDay.find(result => result._id === "Incompleted");

      const successCount = successResult ? successResult.count : 0;
      const failedCount = failedResult ? failedResult.count : 0;
      const incompleteCount = incompleteResult ? incompleteResult.count : 0;

      const successAmount = successResult ? successResult.totalAmount : 0;
      const failedAmount = failedResult ? failedResult.totalAmount : 0;
      const incompleteAmount = incompleteResult ? incompleteResult.totalAmount : 0;

      const dayFormatted = dayDate.toLocaleDateString("en-US");

      results.push({
        date: dayFormatted,
        successCount,
        failedCount
      });
      transactionCounts.push({
        date: dayFormatted,
        totalCount: successCount + failedCount + incompleteCount
      })
      currentWeekSuccessTotalCount += successCount

      successThisWeek += successAmount;
      failedThisWeek += failedAmount;
      incompleteThisWeek += incompleteAmount;

      totalThisWeek = successThisWeek + failedThisWeek + incompleteThisWeek ;
      totalNumTxn += successCount + failedCount + incompleteCount
    }

    const previousweekstartDate = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousweekendDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fromDate = new Date(previousweekstartDate.getFullYear(), previousweekstartDate.getMonth(), previousweekstartDate.getDate(), 0, 0, 0);
  const toDate = new Date(previousweekendDate.getFullYear(), previousweekendDate.getMonth(), previousweekendDate.getDate(), 23, 59, 59);

  const formattedFromDate = `${("0" + fromDate.getDate()).slice(-2)}/${("0" + (fromDate.getMonth() + 1)).slice(-2)}/${fromDate.getFullYear()} 00:00:00`;
  const formattedToDate = `${("0" + toDate.getDate()).slice(-2)}/${("0" + (toDate.getMonth() + 1)).slice(-2)}/${toDate.getFullYear()} 23:59:59`;

  const query = {
    transactiondate: { $gte: formattedFromDate, $lte: formattedToDate },
    Status: "Success",
    currency: currency
  };
  
  if (merchant) {
    query.merchant = merchant;
  }
  
  const aggregationPipeline = [
    { $match: query },
    { 
      $group: { 
        _id: null, 
        count: { $sum: 1 }
      } 
    }
  ];
  
  const previousresults = await LiveTransactionTable.aggregate(aggregationPipeline);

  const previousWeekSuccessTotalCount = previousresults.length > 0 ? previousresults[0].count : 0;
  console.log(currentWeekSuccessTotalCount);
  console.log(previousWeekSuccessTotalCount)
    let percentageChange;
    if (previousWeekSuccessTotalCount !== 0) {
      percentageChange =
        ((currentWeekSuccessTotalCount - previousWeekSuccessTotalCount) /
          (previousWeekSuccessTotalCount)) *
        100;
    } else {
      percentageChange = 100;
    }

    res.status(200).json({
      results,
      successThisWeek: parseFloat(successThisWeek.toFixed(3)),
      failedThisWeek: parseFloat(failedThisWeek.toFixed(3)),
      totalThisWeek: parseFloat(totalThisWeek.toFixed(3)),
      transactionCounts,
      totalNumTxn,
      percentageChange : parseFloat(percentageChange.toFixed(3))
    });
  } catch (error) {
    console.error("Error calculating past seven days counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const AdminweeklyCardComparison = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    const currentDate = new Date();
    const currentWeekStartDate = new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000);

    const previousweekstartDate = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousweekendDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const formattedCurrentWeekStartDate = `${(
      "0" + currentWeekStartDate.getDate()
    ).slice(-2)}/${("0" + (currentWeekStartDate.getMonth() + 1)).slice(
      -2
    )}/${currentWeekStartDate.getFullYear()} 00:00:00`;
    
    const formattedCurrentWeekEndDate = `${(
      "0" + currentDate.getDate()
    ).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(
      -2
    )}/${currentDate.getFullYear()} 23:59:59`;

    const formattedPreviousWeekStartDate = `${(
      "0" + previousweekstartDate.getDate()
    ).slice(-2)}/${("0" + (previousweekstartDate.getMonth() + 1)).slice(
      -2
    )}/${previousweekstartDate.getFullYear()} 00:00:00`;

    const formattedPreviousWeekEndDate = `${(
      "0" + previousweekendDate.getDate()
    ).slice(-2)}/${("0" + (previousweekendDate.getMonth() + 1)).slice(
      -2
    )}/${previousweekendDate.getFullYear()} 23:59:59`;

    query = {
      transactiondate: { $gte: formattedCurrentWeekStartDate, $lte: formattedCurrentWeekEndDate },
      currency: currency
    };
    if (merchant) {
      query.merchant = merchant;
    }

    aggregationPipeline = [
      { $match: query },
      {$group: { 
        _id: "$cardtype", 
        totalAmount: { $sum: "$amount" } 
      } }
    ];

    const resultsForCurrent = await LiveTransactionTable.aggregate(aggregationPipeline);
    console.log(resultsForCurrent)
    const CurrentvisaResult = resultsForCurrent.find(result => result._id === "Visa");
    const CurrentmastercardResult = resultsForCurrent.find(result => result._id === "Mastercard");

    const currentWeekVisaAmount = CurrentvisaResult ? CurrentvisaResult.totalAmount : 0;
    const currentWeekMastercardAmount = CurrentmastercardResult ? CurrentmastercardResult.totalAmount : 0;

    queryPrevious = {
      transactiondate: { $gte: formattedPreviousWeekStartDate, $lte: formattedPreviousWeekEndDate},
      currency: currency
    };
    if (merchant) {
      queryPrevious.merchant = merchant;
    }

    aggregationPipeline = [
      { $match: queryPrevious },
      {$group: { 
        _id: "$cardtype", 
        totalAmount: { $sum: "$amount" } 
      } }
    ];

    const resultsForPrevious = await LiveTransactionTable.aggregate(aggregationPipeline);
    console.log(resultsForPrevious)
    
    const PreviousvisaResult = resultsForPrevious.find(result => result._id === "Visa");
    const PreviousmastercardResult = resultsForPrevious.find(result => result._id === "Mastercard");

    const PreviousWeekVisaAmount = PreviousvisaResult ? PreviousvisaResult.totalAmount : 0;
    const PreviousWeekMastercardAmount = PreviousmastercardResult ? PreviousmastercardResult.totalAmount : 0;

    const visaDifference = parseFloat(
      (currentWeekVisaAmount - PreviousWeekVisaAmount).toFixed(3)
    );
    const mastercardDifference = parseFloat(
      (currentWeekMastercardAmount - PreviousWeekMastercardAmount).toFixed(3)
    );

    res.status(200).json({ visaDifference: parseFloat(visaDifference.toFixed(3)), mastercardDifference: parseFloat(mastercardDifference.toFixed(3)) });
  } catch (error) {
    console.error("Error calculating card transaction difference:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const AdminweeklyTop4Countries = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    const currentDate = new Date();
    const currentWeekStartDate = new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000);

    const formattedCurrentWeekStartDate = `${(
      "0" + currentWeekStartDate.getDate()
    ).slice(-2)}/${("0" + (currentWeekStartDate.getMonth() + 1)).slice(
      -2
    )}/${currentWeekStartDate.getFullYear()} 00:00:00`;
    
    const formattedCurrentWeekEndDate = `${(
      "0" + currentDate.getDate()
    ).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(
      -2
    )}/${currentDate.getFullYear()} 23:59:59`;

    
    const aggregationPipeline = [
      {
        $match: {
          transactiondate: {
            $gte: formattedCurrentWeekStartDate ,
            $lte: formattedCurrentWeekEndDate,
          },
          currency: currency,
          merchant: merchant || { $exists: true }, 
          country: { $ne: "0" }, 
        },
      },
      {
        $group: {
          _id: "$country",
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { transactionCount: -1 },
      },
      {
        $limit: 4,
      },
    ];

    const results = await LiveTransactionTable.aggregate(aggregationPipeline);

    res.status(200).json({
      topCountries: results,
    });
  } catch (error) {
    console.error("Error calculating top 4 country stats for the week:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const AdminmonthlyTransactionMetrics = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    let numTransactions = 0;
    let numSuccessfulTransactions = 0;
    let totalAmountTransactions = 0;
    let totalAmountSuccessfulTransactions = 0;

    for (let i = 0; i < 32; i++) {
      const dayDate = new Date(thirtyDaysAgo);
      dayDate.setDate(thirtyDaysAgo.getDate() + i);

      const formattedFromDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 00:00:00`;
      const formattedToDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 23:59:59`;

      if (merchant) {
        transactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
          merchant: merchant,
        });
      } else {
        transactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
        });
      }

      numTransactions += transactions.length;
      totalAmountTransactions += transactions.reduce(
        (total, txn) => total + txn.amount,
        0
      );
      totalAmountTransactions = parseFloat(totalAmountTransactions.toFixed(3));
      const successfulTransactions = transactions.filter(
        (txn) => txn.Status === "Success"
      );
      numSuccessfulTransactions += successfulTransactions.length;
      totalAmountSuccessfulTransactions += successfulTransactions.reduce(
        (total, txn) => total + txn.amount,
        0
      );
    }

    totalAmountSuccessfulTransactions = parseFloat(
      totalAmountSuccessfulTransactions.toFixed(3)
    );

    let numTransactionsPreviousMonth = 0;
    let numSuccessfulTransactionsPreviousMonth = 0;

    for (let i = 32; i < 60; i++) {
      const dayDate = new Date(thirtyDaysAgo);
      dayDate.setDate(thirtyDaysAgo.getDate() + i);

      const formattedFromDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 00:00:00`;
      const formattedToDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 23:59:59`;

      if (merchant) {
        transactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
          merchant: merchant,
        });
      } else {
        transactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
        });
      }
      numTransactionsPreviousMonth += transactions.length;

      const successfulTransactions = transactions.filter(
        (txn) => txn.Status === "Success"
      );
      numSuccessfulTransactionsPreviousMonth += successfulTransactions.length;
    }

    const growthPercentage =
      numSuccessfulTransactionsPreviousMonth === 0
        ? 100
        : ((numSuccessfulTransactions -
            numSuccessfulTransactionsPreviousMonth) /
            numSuccessfulTransactionsPreviousMonth) *
          100;

    res.status(200).json({
      numTransactions,
      numSuccessfulTransactions,
      totalAmountTransactions,
      totalAmountSuccessfulTransactions,
      growthPercentage,
    });
  } catch (error) {
    console.error("Error calculating last 30 days stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
  
const Adminsuccesslast6Months = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    if (merchant) {
      transactions = await LiveTransactionTable.find({
        Status: "Success",
        currency: currency,
        merchant: merchant,
      });
    } else {
      transactions = await LiveTransactionTable.find({
        Status: "Success",
        currency: currency,
      });
    }
    const salesByMonth = {};
    let totalSales = 0;

    for (let i = 0; i < 6; i++) {
      const currentDate = new Date();
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      ).to;
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i + 1,
        0
      ).toISOString();
console.log(startDate);
console.log(endDate)
      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(
          transaction.transactiondate.replace(
            /(\d{2})\/(\d{2})\/(\d{4})/,
            "$2/$1/$3"
          )
        );
        return transactionDate >= startDate && transactionDate <= endDate;
      });
      let totalAmount = filteredTransactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
      );

      totalAmount = parseFloat(totalAmount.toFixed(3));

      salesByMonth[
        startDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      ] = totalAmount;
      totalSales += totalAmount;
    }

    res.json({ salesByMonth, totalSales });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
};

module.exports = {
  AdminsuccessPercentageToday,
  AdminweeklyStats,
  AdminweeklyCardComparison,
  AdminweeklyTop4Countries,
  Adminsuccesslast6Months,
  AdminmonthlyTransactionMetrics,
};
