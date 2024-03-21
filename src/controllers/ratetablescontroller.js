require("../config/database");
const Ratetable = require("../models/Ratetable");

async function createRatetable(req, res) {
  try {
    const {
      company_name,
      MDR,
      txn_app,
      txn_dec,
      RR,
      settlement_fee,
      refund_fee,
      chargeback_fee,
    } = req.body;

    // Create a new Transactiontable
    const ratetable = new Ratetable({
      company_name,
      MDR,
      txn_app,
      txn_dec,
      RR,
      settlement_fee,
      refund_fee,
      chargeback_fee,
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

async function getRates(req,res) {
  try {
    const rates = await Ratetable.find();
    res.status(200).json(rates);
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

async function updateRatetable(req, res) {
  try {
    const { company_name, settlement_scheme, MDR, txn_app, txn_dec, txn_total, RR, settlement_fee } = req.body;
    if (!company_name) {
      return res.status(400).json({ error: "Company name is required" });
    }

    let ratetable = await Ratetable.findOne({ company_name });
    if (!ratetable) {
      return res.status(404).json({ error: "Ratetable for this company not found" });
    }

    if (settlement_scheme !== undefined) {
      ratetable.settlement_scheme = settlement_scheme;
    }
    if (MDR !== undefined) {
      ratetable.MDR = MDR;
    }
    if (txn_app !== undefined) {
      ratetable.txn_app = parseFloat(txn_app);
      if (isNaN(ratetable.txn_app)) {
        return res.status(400).json({ error: "Invalid value for txn_app, must be a number" });
      }
    }
    if (txn_dec !== undefined) {
      ratetable.txn_dec = parseFloat(txn_dec);
      if (isNaN(ratetable.txn_dec)) {
        return res.status(400).json({ error: "Invalid value for txn_dec, must be a number" });
      }
    }
    if (txn_total !== undefined) {
      ratetable.txn_total = parseFloat(txn_total);
      if (isNaN(ratetable.txn_total)) {
        return res.status(400).json({ error: "Invalid value for txn_total, must be a number" });
      }
    }
    if (RR !== undefined) {
      ratetable.RR = parseFloat(RR);
      if (isNaN(ratetable.RR)) {
        return res.status(400).json({ error: "Invalid value for RR, must be a number" });
      }
    }
    if (settlement_fee !== undefined) {
      ratetable.settlement_fee = parseFloat(settlement_fee);
      if (isNaN(ratetable.settlement_fee)) {
        return res.status(400).json({ error: "Invalid value for settlement_fee, must be a number" });
      }
    }

    ratetable = await ratetable.save();

    res.status(200).json({ message: "Ratetable updated successfully", ratetable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


module.exports = { createRatetable, getRatetable, getRates, updateRatetable };
