require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");
const Settlementtable = require("../models/Settlementtable");
const Client = require("../models/Client");
const Acquirer = require("../models/Acquirer");

const ApprovalRatioChart = async (req, res) => {
  let { startDate, endDate, interval } = req.query;

  if (!startDate || !endDate || !interval) {
    return res.status(400).send({ error: 'startDate, endDate, and interval query parameters are required' });
  }

  console.log(startDate);
  console.log(endDate);

  startDate = startDate.split("T")[0] + " 00:00:00"
  endDate = endDate.split("T")[0] + " 23:59:59"

  console.table({ startDate, endDate, interval });

  try {

    if (interval)
      res.json({ message: "Running" })
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

const approvalRatio = async (req, res) => {
  const { fromDate, toDate, merchant } = req.body;

  if (!fromDate || !toDate || !merchant) {
      return res.status(400).json({ error: 'fromDate, toDate, and merchant are required parameters' });
  }

  try {
      const from = `${fromDate} 00:00:00`;
      const to = `${toDate} 23:59:59`;

      const transactions = await LiveTransactionTable.find({
          merchant: merchant,
          transactiondate: { $gte: from, $lte: to }
      });

      const totalTransactions = transactions.length;
      const successfulTransactions = transactions.filter(transaction => transaction.Status === 'Success').length;
      const approvalRatio = totalTransactions === 0 ? 0 : (successfulTransactions / totalTransactions) * 100;

      res.json({ approvalRatio });
  } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'An error occurred while fetching transactions' });
  }
};

const volumeSum = async (req, res) => {
  const { company_name } = req.query;
  if (!company_name) {
      return res.status(400).json({ error: 'company_name is a required parameter' });
  }
  try {
      const pipeline = [
          {
              $match: {
                  company_name: company_name
              }
          },
          {
              $group: {
                  _id: null,
                  totalVolume: { $sum: "$total_vol" },
                  settledVolume: { $sum: "$settlement_vol" }
              }
          },
          {
              $project: {
                  _id: 0,
                  totalVolume: 1,
                  settledVolume: 1,
              }
          }
      ];

      const result = await Settlementtable.aggregate(pipeline);
      const totalVolume = result.length > 0 ? result[0].totalVolume : 0;
      const settledVolume = result.length > 0 ? result[0].settledVolume : 0;
      res.json({ totalVolume, settledVolume });
  } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'An error occurred while fetching transactions' });
  }
};

const countriesList = async (req, res) => {
  try {
    const countries = await LiveTransactionTable.aggregate([
      {
        $group: {
          _id: "$country"
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);

    const capitalizedCountries = new Set();
    countries.forEach(country => {
      capitalizedCountries.add(capitalizeCountryName(country._id));
    });

    const distinctCapitalizedCountries = Array.from(capitalizedCountries);

    res.status(200).json(
      distinctCapitalizedCountries
    );
  } catch (error) {
    console.error("Error processing distinct capitalized countries:", error);
    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

const capitalizeCountryName = (country) => {
  if (!country) return '';
  return country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
};

const midList = async (req, res) => {
  try {
    const mids = await LiveTransactionTable.distinct("mid");
    res.json(mids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function listSettlement(req, res) {
  try {
    const client_records = await Client.find();
    const settlement_records = await Settlementtable.find();

    const client_length = client_records.length;

    const settlement_length = settlement_records.length;

    let totalVolSum = 0;
    let settlementVolSum = 0;

    for (const record of settlement_records) {
      totalVolSum += parseFloat(record.total_vol);
      settlementVolSum += parseFloat(record.settlement_vol);
    }

    res.json({
      client_length,
      settlement_length,
      totalVolSum,
      settlementVolSum,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getCompanyList(req, res) {
  try {
    const { status = 'all' } = req.query;

    if (status !== 'all' && status !== 'Active') {
      throw new Error('Invalid status. Status can either be All or Active');
    }

    let query = {};
    if (status === 'all') {
      query = {};
    } else if (status === 'Active') {
      query.status = 'Active';
    }

    const company_names = await Client.distinct("company_name", query);
    res.json(company_names);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
}

async function getCurrenciesOfCompany(req, res) {
  try {
    const company_name = req.query.company_name;

    if (!company_name) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const client = await Client.findOne({ company_name: company_name });

    if (!client) {
      return res.status(404).json({ message: "Company not found" });
    }
    currencies = client["currency"];
    res.json(currencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function acquirerList(req, res) {
  try {
    const acquirerNames = await Acquirer.distinct("acquirer_name");
    res.status(200).json(acquirerNames);
  } catch (error) {
    console.error("Error fetching unique acquirer names:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
module.exports = { 
  ApprovalRatioChart, 
  approvalRatio, 
  countriesList,
  midList,
  volumeSum,
  listSettlement,
  getCompanyList,
  getCurrenciesOfCompany,
  acquirerList}