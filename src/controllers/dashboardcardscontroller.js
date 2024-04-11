require("../config/database");
const Transactiontable = require("../models/Transactiontable");
const mongoose = require('mongoose');

const calculateSuccessPercentageController = async (req, res) => {
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

    const distinctUsers = await Transactiontable.distinct('cname', {
      transactiondate: {
        $gte: fromDate,
        $lt: toDate
      }
    });

    const successPercentages = [];
    for (const user of distinctUsers) {
      const successCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate
        },
        Status: 'Success',
        cname: user
      });

      const totalCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate
        },
        cname: user
      });

      let successPercentage;
      if (totalCount === 0) {
        successPercentage = 0;
      } else {
        successPercentage = (successCount / totalCount) * 100;
      }

      successPercentages.push({ cname: user, successPercentage: successPercentage.toFixed(2) });
    }

    const allUsers = await Transactiontable.distinct('cname');
    for (const user of allUsers) {
      if (!distinctUsers.includes(user)) {
        successPercentages.push({ cname: user, successPercentage: '0.00' });
      }
    }

    res.status(200).json(successPercentages);
  } catch (error) {
    console.error('Error calculating success percentage per user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateSuccessAmountController = async (req, res) => {
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
          _id: '$cname',
          successAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          cname: '$_id',
          successAmount: 1
        }
      }
    ]);

    const distinctUsers = await Transactiontable.distinct('cname');
    for (const user of distinctUsers) {
      const userRecord = successAmounts.find(record => record.cname === user);
      if (!userRecord) {
        successAmounts.push({ cname: user, successAmount: 0 });
      }
    }

    res.status(200).json(successAmounts);
  } catch (error) {
    console.error('Error calculating success amount:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateSuccessCountController = async (req, res) => {
  try {
    const currentDate = new Date();

    const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
    const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

    const distinctUsers = await Transactiontable.distinct('cname', {
      transactiondate: {
        $gte: fromDate,
        $lt: toDate
      }
    });

    const successCounts = [];
    for (const user of distinctUsers) {
      const successCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate
        },
        Status: 'Success',
        cname: user
      });

      successCounts.push({ cname: user, successCount });
    }

    const allUsers = await Transactiontable.distinct('cname');
    for (const user of allUsers) {
      if (!distinctUsers.includes(user)) {
        successCounts.push({ cname: user, successCount: 0 });
      }
    }

    res.status(200).json(successCounts);
  } catch (error) {
    console.error('Error calculating success count per user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculatePastSevenDaysController = async (req, res) => {
  try {
    const distinctUsers = await Transactiontable.distinct('cname');

    const results = [];

    for (const user of distinctUsers) {
      const countsForUser = [];


      for (let i = 1; i <= 7; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - i);

        const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
        const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;


        const successCount = await Transactiontable.countDocuments({
          transactiondate: {
            $gte: fromDate,
            $lt: toDate
          },
          Status: 'Success',
          cname: user
        });

        const failedCount = await Transactiontable.countDocuments({
          transactiondate: {
            $gte: fromDate,
            $lt: toDate
          },
          Status: 'Failed',
          cname: user
        });

        countsForUser.push({
          user,
          date: currentDate.toISOString().split('T')[0],
          successCount,
          failedCount
        });
      }

      results.push(countsForUser);
    }
    res.status(200).json({ results });
  } catch (error) {
    console.error('Error calculating past seven days counts per user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = { calculateSuccessPercentageController,
  calculateSuccessAmountController, 
  calculateSuccessCountController,
  calculatePastSevenDaysController };
