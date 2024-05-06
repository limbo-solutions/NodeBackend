require("../config/database");
const Transactiontable = require("../models/Transactiontable");

const DummysuccessPercentageToday = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    const fromDate = "2024-04-17 00:00:00";
    const toDate = "2024-04-17 23:59:59";

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

    const resultsForDay = await Transactiontable.aggregate(aggregationPipeline);

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

const DummyweeklyStats = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    const currentDate = new Date(2024, 3, 17);
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

  // const fromDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0).toISOString();
  // const toDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59).toISOString();

  const fromDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
  const toDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59);

  const formattedFromDate = `${fromDate.getFullYear()}-${("0" + (fromDate.getMonth() + 1)).slice(-2)}-${("0" + fromDate.getDate()).slice(-2)}  00:00:00`;
  const formattedToDate = `${toDate.getFullYear()}-${("0" + (toDate.getMonth() + 1)).slice(-2)}-${("0" + toDate.getDate()).slice(-2)} 23:59:59`;

      const query = {
        transactiondate: { $gte: formattedFromDate, $lte: formattedToDate },
        currency: currency
      };
      if (merchant) {
        query.merchant = merchant;
      }

      // const query = {
      //   transactiondate: { $gte: fromDate, $lte: toDate },
      //   currency: currency
      // };
      // if (merchant) {
      //   query.merchant = merchant;
      // }

      const aggregationPipeline = [
        { $match: query },
        {$group: { 
          _id: "$Status", 
          count: { $sum: 1 }, 
          totalAmount: { $sum: "$amount" } 
        } }
      ];

      const resultsForDay = await Transactiontable.aggregate(aggregationPipeline);
      
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
        failedCount,incompleteCount
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

  //   const fromDate = new Date(previousweekstartDate.getFullYear(), previousweekstartDate.getMonth(), previousweekstartDate.getDate(), 0, 0, 0).toISOString();
  // const toDate = new Date(previousweekendDate.getFullYear(), previousweekendDate.getMonth(), previousweekendDate.getDate(), 23, 59, 59).toISOString();

 

  const fromDate = `${previousweekstartDate.getFullYear()}-${(
    "0" +
    (previousweekstartDate.getMonth() + 1)
  ).slice(-2)}-${("0" + previousweekstartDate.getDate()).slice(-2)} 00:00:00`;
const toDate = `${previousweekendDate.getFullYear()}-${(
  "0" +
  (previousweekendDate.getMonth() + 1)
).slice(-2)}-${("0" + previousweekendDate.getDate()).slice(-2)} 23:59:59`;

  const query = {
    transactiondate: { $gte: fromDate, $lte: toDate },
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
  
  const previousresults = await Transactiontable.aggregate(aggregationPipeline);

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

const DummyweeklyCardComparison = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    query = {
      transactiondate: { $gte: "2024-04-10 00:00:00", $lte: "2024-04-17 23:59:59" },
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

    const resultsForCurrent = await Transactiontable.aggregate(aggregationPipeline);
    console.log(resultsForCurrent)
    const CurrentvisaResult = resultsForCurrent.find(result => result._id === "Visa");
    const CurrentmastercardResult = resultsForCurrent.find(result => result._id === "Mastercard");

    const currentWeekVisaAmount = CurrentvisaResult ? CurrentvisaResult.totalAmount : 0;
    const currentWeekMastercardAmount = CurrentmastercardResult ? CurrentmastercardResult.totalAmount : 0;

    queryPrevious = {
      transactiondate: { $gte: "2024-04-03 00:00:00", $lte: "2024-04-10 23:59:59"},
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

    const resultsForPrevious = await Transactiontable.aggregate(aggregationPipeline);
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

const DummyweeklyTop4Countries = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    const aggregationPipeline = [
      {
        $match: {
          transactiondate: {
            $gte: "2024-04-17 00:00:00" ,
            $lte: "2024-04-20 23:59:59",
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

    const results = await Transactiontable.aggregate(aggregationPipeline);

    res.status(200).json({
      topCountries: results,
    });
  } catch (error) {
    console.error("Error calculating top 4 country stats for the week:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const DummymonthlyTransactionMetrics = async (req, res) => {
  const { currency, merchant } = req.query;
  try {

    const pipeline = [
      {
        $match: {
          transactiondate: {
            $gte: "2024-03-17 00:00:00",
            $lte: "2024-04-17 23:59:59",
          },
          currency: currency,
          ...(merchant && { merchant: merchant }),
        },
      },
      {
        $group: {
          _id: null,
          numTransactions: { $sum: 1 },
          totalAmountTransactions: { $sum: "$amount" },
          numSuccessfulTransactions: {
            $sum: { $cond: [{ $eq: ["$Status", "Success"] }, 1, 0] },
          },
          totalAmountSuccessfulTransactions: {
            $sum: { $cond: [{ $eq: ["$Status", "Success"] }, "$amount", 0] },
          },
        },
      },
    ];

    const result = await Transactiontable.aggregate(pipeline);

    let growthPercentage = 100;
    if (result.length > 0) {
      // Previous month aggregation
      const previousMonthResult = await Transactiontable.aggregate([
        {
          $match: {
            transactiondate: {
              $gte: "2024-02-17 00:00:00",
              $lte: "2024-03-17 23:59:59",
            },
            currency: currency,
            ...(merchant && { merchant: merchant }),
          },
        },
        {
          $group: {
            _id: null,
            numSuccessfulTransactionsPreviousMonth: {
              $sum: { $cond: [{ $eq: ["$Status", "Success"] }, 1, 0] },
            },
          },
        },
      ]);

      if (previousMonthResult.length > 0) {
        const { numSuccessfulTransactionsPreviousMonth } = previousMonthResult[0];
        growthPercentage = ((result[0].numSuccessfulTransactions - numSuccessfulTransactionsPreviousMonth) / numSuccessfulTransactionsPreviousMonth) * 100;
      }
    }

    res.status(200).json({
      ...result[0],
      growthPercentage,
    });
  } catch (error) {
    console.error("Error calculating last 30 days stats using aggregation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const Dummysuccesslast6Months = async (req, res) => {
  const { currency, merchant } = req.query;
  try {
    const currentDate = new Date(2024,3,17);
    console.log(currentDate)
    let startMonth = currentDate.getMonth() - 5;
    let startYear = currentDate.getFullYear();
    if (startMonth < 0) {
      startMonth += 12;
      startYear--;
    }
    const endMonth = currentDate.getMonth() + 1;
    const endYear = currentDate.getFullYear();
    const pipeline = [
      {
        $addFields: {
          transactionDate: {
            $dateFromString: {
              dateString: "$transactiondate",
              format: "%Y-%m-%d %H:%M:%S"
            }
          }
        }
      },
      {
        $match: {
          Status: "Success",
          currency: currency,
          ...(merchant && { merchant: merchant }),
          transactionDate: {
            $gte: new Date(startYear, startMonth, 1, 0, 0, 0),
            $lte: new Date(endYear, endMonth, 1, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$transactionDate" },
            year: { $year: "$transactionDate" }
          },
          totalAmount: { $sum: "$amount" },
          numTransactions: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          totalAmount: 1,
          numTransactions: 1
        }
      }
    ];

    const result = await Transactiontable.aggregate(pipeline);
console.log(result)
    const salesByMonth = {};
    let totalSales = 0;

    // Initialize salesByMonth with 0 values for all 6 months
    for (let i = 0; i < 6; i++) {
      let month = startMonth + i;
      let year = startYear;
      if (month > 11) {
        month -= 12;
        year++;
      }
      salesByMonth[`${month + 1}/${year}`] = 0;
    }

    result.forEach(({ month, year, totalAmount }) => {
      salesByMonth[`${month}/${year}`] = totalAmount;
      totalSales += totalAmount;
    });

    res.json({ salesByMonth, totalSales });
  } catch (error) {
    console.error("Error fetching data using aggregation:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
};

module.exports = {
  DummysuccessPercentageToday,
  DummyweeklyStats,
  DummyweeklyCardComparison,
  DummyweeklyTop4Countries,
  Dummysuccesslast6Months,
  DummymonthlyTransactionMetrics,
};
