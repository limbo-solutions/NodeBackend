require("../config/database");
const Ratetable = require("../models/Ratetable");

async function createRatetable(req, res) {
  try {
    const {
      company_name,
      settlement_scheme,
      MDR,
      txn_app,
      txn_dec,
      txn_total,
      RR,
      settlement_fee,
    } = req.body;

    // Create a new Transactiontable
    const ratetable = new Ratetable({
      company_name,
      settlement_scheme,
      MDR,
      txn_app,
      txn_dec,
      txn_total,
      RR,
      settlement_fee,
    });

    // Save the Transactiontable to the database
    await ratetable.save();

    res.status(201).json({
      message: "Ratetable created successfully",
      ratetable: ratetable,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getRatetable(req, res) {
  try {
    const { company_name } = req.query; // Retrieve company_name from query string
    if (!company_name) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const ratetable = await Ratetable.findOne({ company_name });
    if (ratetable) {
      res.status(200).json(ratetable);
    } else {
      res.status(404).json({ error: "Rates for this company not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createRatetable, getRatetable };
