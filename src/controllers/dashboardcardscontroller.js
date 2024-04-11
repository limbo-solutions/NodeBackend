require("../config/database");
const Transactiontable = require("../models/Transactiontable");
const mongoose = require('mongoose');

const calculateSuccessPercentage = async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();
    
    const fromDate = `${("0" + currentDate.getDate()).slice(
      -2
    )}/${("0" + (currentDate.getMonth() + 1)).slice(
      -2
    )}/${currentDate.getFullYear()} 00:00:00`;

    const toDate = `${("0" + currentDate.getDate()).slice(
      -2
    )}/${("0" + (currentDate.getMonth() + 1)).slice(
      -2
    )}/${currentDate.getFullYear()} 23:59:59`;

    const successCount = await Transactiontable.countDocuments({
      transactiondate: {
        $gte: fromDate,
        $lt: toDate
      },
      Status: 'Success'
    });

    const totalCount = await Transactiontable.countDocuments({
      transactiondate: {
        $gte: fromDate,
        $lt: toDate
      }
    });

    let successPercentage;
    if (totalCount === 0) {
      successPercentage = 0;
    } else {
      successPercentage = (successCount / totalCount) * 100;
    }

    res.status(200).json({ successPercentage: successPercentage.toFixed(2) });
  } catch (error) {
    console.error('Error calculating success percentage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const calculateSuccessAmount = async (req, res) => {
  try {
    const currentDate = new Date();

    const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
    const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

    const successAmounts = await Transactiontable.aggregate([
      {
        $match: {
          transactiondate: {
            $gte: fromDate,
            $lt: toDate
          },
          Status: 'Success'
        }
      },
      {
        $group: {
          _id: null,
          successAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          successAmount: 1
        }
      }
    ]);

    res.status(200).json(successAmounts);
  } catch (error) {
    console.error('Error calculating success amount:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const calculateSuccessCount = async (req, res) => {
  try {
    const currentDate = new Date();

    const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
    const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

    const successCount = await Transactiontable.countDocuments({
      transactiondate: {
        $gte: fromDate,
        $lt: toDate
      },
      Status: 'Success'
    });

    res.status(200).json({ successCount });
  } catch (error) {
    console.error('Error calculating success count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculatePastSevenDays = async (req, res) => {
  try {
    const currentDate = new Date();
    const results = [];

    for (let i = 1; i <= 7; i++) {
      const countsForDay = [];
      const dayDate = new Date();
      dayDate.setDate(currentDate.getDate() - i);

      const fromDate = `${("0" + dayDate.getDate()).slice(-2)}/${("0" + (dayDate.getMonth() + 1)).slice(-2)}/${dayDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + dayDate.getDate()).slice(-2)}/${("0" + (dayDate.getMonth() + 1)).slice(-2)}/${dayDate.getFullYear()} 23:59:59`;

      const successCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate
        },
        Status: 'Success'
      });

      const failedCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate
        },
        Status: 'Failed'
      });

      countsForDay.push({
        date: dayDate.toISOString().split('T')[0],
        successCount,
        failedCount
      });

      results.push(countsForDay);
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error calculating past seven days counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateTransactionAmounts = async (req, res) => {
  try {
    let successThisWeek = 0;
    let failedThisWeek = 0;

    // Loop through the past 7 days
    for (let i = 1; i <= 7; i++) {
      // Get the date for i days ago
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      // Construct the start and end of the day as strings
      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      // Find the amount for successful transactions within the day
      const successTransactions = await Transactiontable.find({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate
        },
        Status: 'Success'
      });
      successTransactions.forEach(txn => {
        successThisWeek += txn.amount;
      });

      // Find the amount for failed transactions within the day
      const failedTransactions = await Transactiontable.find({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate
        },
        Status: 'Failed'
      });
      failedTransactions.forEach(txn => {
        failedThisWeek += txn.amount;
      });
    }

    // Calculate total amount for the week
    const totalThisWeek = successThisWeek + failedThisWeek;

    // Send the results as response
    res.status(200).json({ successThisWeek, failedThisWeek, totalThisWeek });
  } catch (error) {
    console.error('Error calculating transaction amounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateTransactionCounts = async (req, res) => {
  try {
    // Initialize an object to store transaction counts for each day
    const transactionCounts = {
      Date1: 0,
      Date2: 0,
      Date3: 0,
      Date4: 0,
      Date5: 0,
      Date6: 0,
      Date7: 0,
    };

    // Loop through the past 7 days
    for (let i = 1; i <= 7; i++) {
      // Get the date for i days ago
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      // Construct the start and end of the day as strings
      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      // Find the count of transactions within the day
      const transactionCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate
        }
      });

      // Store the count for the current day
      transactionCounts[`Date${i}`] = transactionCount;
    }

    // Calculate total transaction count for the week
    const totalThisWeek = Object.values(transactionCounts).reduce((total, count) => total + count, 0);

    // Send the results as response
    res.status(200).json({ ...transactionCounts, totalThisWeek });
  } catch (error) {
    console.error('Error calculating transaction counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateTransactionComparison = async (req, res) => {
  try {
    // Initialize variables to store total amounts for Visa and Mastercard for this week and the previous week
    let totalAmountVisaThisWeek = 0;
    let totalAmountMastercardThisWeek = 0;
    let totalAmountVisaLastWeek = 0;
    let totalAmountMastercardLastWeek = 0;

    // Loop through the past 7 days
    for (let i = 0; i < 7; i++) {
      // Get the date for i days ago and i+7 days ago
      const currentDate = new Date();
      const previousDate = new Date();
      previousDate.setDate(previousDate.getDate() - (7 + i));
      currentDate.setDate(currentDate.getDate() - i);

      // Construct the start and end of the day as strings
      const fromDate = `${("0" + previousDate.getDate()).slice(-2)}/${("0" + (previousDate.getMonth() + 1)).slice(-2)}/${previousDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      // Find the total amount of transactions for Visa and Mastercard for this week
      const visaTransactionsThisWeek = await Transactiontable.aggregate([
        {
          $match: {
            transactiondate: {
              $gte: fromDate,
              $lt: toDate
            },
            cardtype: 'Visa'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);
      if (visaTransactionsThisWeek.length > 0) {
        totalAmountVisaThisWeek += visaTransactionsThisWeek[0].totalAmount;
      }

      const mastercardTransactionsThisWeek = await Transactiontable.aggregate([
        {
          $match: {
            transactiondate: {
              $gte: fromDate,
              $lt: toDate
            },
            cardtype: 'Mastercard'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);
      if (mastercardTransactionsThisWeek.length > 0) {
        totalAmountMastercardThisWeek += mastercardTransactionsThisWeek[0].totalAmount;
      }

      // Find the total amount of transactions for Visa and Mastercard for the previous week
      const previousFromDate = new Date(previousDate);
      previousFromDate.setDate(previousFromDate.getDate() - 7);
      const previousToDate = new Date(previousDate);
      const previousVisaTransactions = await Transactiontable.aggregate([
        {
          $match: {
            transactiondate: {
              $gte: previousFromDate,
              $lt: previousToDate
            },
            cardtype: 'Visa'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);
      if (previousVisaTransactions.length > 0) {
        totalAmountVisaLastWeek += previousVisaTransactions[0].totalAmount;
      }

      const previousMastercardTransactions = await Transactiontable.aggregate([
        {
          $match: {
            transactiondate: {
              $gte: previousFromDate,
              $lt: previousToDate
            },
            cardtype: 'Mastercard'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);
      if (previousMastercardTransactions.length > 0) {
        totalAmountMastercardLastWeek += previousMastercardTransactions[0].totalAmount;
      }
    }

    // Compare total amounts for Visa and Mastercard between this week and the previous week
    const compareVisa = totalAmountVisaThisWeek > totalAmountVisaLastWeek ? "greater" : "lesser";
    const compareMastercard = totalAmountMastercardThisWeek > totalAmountMastercardLastWeek ? "greater" : "lesser";

    // Send the results as response
    res.status(200).json({ 
      visaTransactThisWeek: totalAmountVisaThisWeek,
      masterTransactThisWeek: totalAmountMastercardThisWeek,
      ComparisonVisa: compareVisa,
      ComparisonMaster: compareMastercard 
    });
  } catch (error) {
    console.error('Error calculating transaction comparison:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateCountryTransactionStats = async (req, res) => {
  try {
    // Initialize an object to store results for each user
    const results = {};

    // Loop through the past 7 days
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      const previousDate = new Date();
      previousDate.setDate(previousDate.getDate() - (7 + i));
      currentDate.setDate(currentDate.getDate() - i);

      // Construct the start and end of the day as strings
      const fromDate = `${("0" + previousDate.getDate()).slice(-2)}/${("0" + (previousDate.getMonth() + 1)).slice(-2)}/${previousDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const transactions = await Transactiontable.find({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate
        }
      });

      // Initialize an object to store transaction stats for each country
      const countryStats = {};

      // Calculate stats for each country for the current day's transactions
      transactions.forEach(transaction => {
        const country = transaction.country;

        // Initialize stats for the country if not already present
        if (!countryStats[country]) {
          countryStats[country] = {
            transactionCount: 0,
            totalAmount: 0
          };
        }

        // Update stats for the country
        countryStats[country].transactionCount++;
        countryStats[country].totalAmount += transaction.amount;
      });

      // Sort countries by total amount in descending order
      const sortedCountries = Object.keys(countryStats).sort((a, b) => {
        return countryStats[b].totalAmount - countryStats[a].totalAmount;
      });

      // Get the top 4 countries
      const top4Countries = sortedCountries.slice(0, 4);

      // Store results for the current day
      const formattedDate = currentDate.toLocaleDateString('en-US');
      results[formattedDate] = {};
      top4Countries.forEach((country, index) => {
        results[formattedDate][`Country${index + 1}`] = country;
        results[formattedDate][`countCountry${index + 1}`] = countryStats[country].transactionCount;
        results[formattedDate][`amountCountry${index + 1}`] = countryStats[country].totalAmount;
      });

      // Calculate total amount for the top 4 countries
      const totalAmountof4Countries = top4Countries.reduce((total, country) => {
        return total + countryStats[country].totalAmount;
      }, 0);

      // Store total amount for the top 4 countries
      results[formattedDate]['totalAmountof4Countries'] = totalAmountof4Countries;
    }

    // Send the results as response
    res.status(200).json({ results });
  } catch (error) {
    console.error('Error calculating top 4 country stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateWeeklySuccessPercentage = async (req, res) => {
  try {
    // Initialize an object to store results for each user
    const results = {};

    // Initialize an object to store success counts for each day of the current week
    const currentWeekSuccessCounts = {};

    // Initialize an object to store success counts for each day of the previous week
    const previousWeekSuccessCounts = {};

    // Loop through the past 7 days to get success counts for the current week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      // Construct the start and end of the day as strings
      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const successCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate
        },
        Status: 'Success'
      });

      // Store success count for the current day
      currentWeekSuccessCounts[currentDate.toLocaleDateString('en-US')] = successCount;
    }

    // Loop through the 7 days before the current week to get success counts for the previous week
    for (let i = 7; i < 14; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      // Construct the start and end of the day as strings
      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const successCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate
        },
        Status: 'Success'
      });

      // Store success count for the current day
      previousWeekSuccessCounts[currentDate.toLocaleDateString('en-US')] = successCount;
    }

    // Calculate total success count for the current week
    const totalCurrentWeekSuccessCount = Object.values(currentWeekSuccessCounts).reduce((total, count) => total + count, 0);

    // Calculate total success count for the previous week
    const totalPreviousWeekSuccessCount = Object.values(previousWeekSuccessCounts).reduce((total, count) => total + count, 0);

    // Calculate percentage change in success counts between current and previous weeks
    let percentageChange;
    if (totalPreviousWeekSuccessCount !== 0) {
      percentageChange = ((totalCurrentWeekSuccessCount - totalPreviousWeekSuccessCount) / (totalPreviousWeekSuccessCount + totalCurrentWeekSuccessCount)) * 100;
    } else {
      percentageChange = 100;
    }

    // Add the results to the response
    results['currentWeekSuccessCounts'] = currentWeekSuccessCounts;

    results['percentageChange'] = percentageChange;

    // Send the results as response
    res.status(200).json({ results });
  } catch (error) {
    console.error('Error calculating weekly success percentage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateLast30DaysMetrics = async (req, res) => {
  try {
    // Get the date for 30 days ago
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 30);
    const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;

    // Get all transactions for the past 30 days
    const transactions = await Transactiontable.find({
      transactiondate: { $gte: fromDate }
    });

    // Initialize total metrics object
    const totalMetrics = {
      transactionCount: 0,
      transactionAmount: 0,
      successCount: 0,
      successAmount: 0
    };

    // Update total metrics based on the transactions
    transactions.forEach(transaction => {
      totalMetrics.transactionCount++;
      totalMetrics.transactionAmount += transaction.amount;

      // Increment success count and amount if transaction is successful
      if (transaction.Status === 'Success') {
        totalMetrics.successCount++;
        totalMetrics.successAmount += transaction.amount;
      }
    });

    // Send the total metrics as response
    res.status(200).json(totalMetrics);
  } catch (error) {
    console.error('Error calculating last 30 days total metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateLast6MonthsSales = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); 
    const currentYear = currentDate.getFullYear();

    const salesByMonth = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0
    };
 
    let totalSalesLast6Months = 0;

    for (let i = 1; i <= 6; i++) {
      const targetMonth = currentMonth - i;
      const targetYear = currentYear - (targetMonth < 0 ? 1 : 0); // Adjust year if target month is in the previous year
      const fromMonth = ("0" + (targetMonth + 1)).slice(-2);
      const fromDate = `${fromMonth}/${("0" + targetYear).slice(-2)} 00:00:00`;
      
      const lastDate = new Date(targetYear, targetMonth + 1, 0);
      const toMonth = ("0" + (lastDate.getMonth() + 1)).slice(-2);
      const toDate = `${("0" + lastDate.getDate()).slice(-2)}/${toMonth}/${lastDate.getFullYear()} 23:59:59`;

      // Find transactions within the target month
      const transactions = await Transactiontable.find({
        transactiondate: { $gte: fromDate, $lte: toDate }
      });

      // Calculate total sales amount for the target month
      let salesAmount = 0;
      transactions.forEach(transaction => {
        salesAmount += transaction.amount;
      });

      // Store sales amount for the target month
      salesByMonth[new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long' })] = salesAmount;
      
      // Add to total sales amount for the last 6 months
      totalSalesLast6Months += salesAmount;
    }

    // Send the results as response
    res.status(200).json({ 
      salesAmountLast6Months: totalSalesLast6Months,
      ...salesByMonth
    });
  } catch (error) {
    console.error('Error calculating last 6 months sales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = { calculateSuccessPercentage,
  calculateSuccessAmount, 
  calculateSuccessCount,
  calculatePastSevenDays,
  calculateTransactionAmounts,
  calculateTransactionCounts,
  calculateTransactionComparison,
  calculateCountryTransactionStats,
  calculateWeeklySuccessPercentage,
  calculateLast30DaysMetrics,
  calculateLast6MonthsSales,
 };
