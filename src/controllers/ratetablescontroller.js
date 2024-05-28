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
      currency,
      setup_fee,
      settlement_cycle,
      annual_maintenance_fee,
      RR_remark,
      setupFee_remark,
      settlementFee_remark,
      annualMaintenanceFee_remark
    } = req.body;

    const ratetable = new Ratetable({
      company_name,
      MDR,
      txn_app,
      txn_dec,
      RR,
      settlement_fee,
      refund_fee,
      chargeback_fee,
      currency,
      setup_fee,
      settlement_cycle,
      annual_maintenance_fee,
      RR_remark,
      setupFee_remark,
      settlementFee_remark,
      annualMaintenanceFee_remark,
    });

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



async function getRates(req, res) {
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
    const { id, ...updateFields } = req.body;

    const rates = await Ratetable.findById(id);

    if (!rates) {
      return res.status(404).json({ error: "Rate table not found" });
    }

    Object.keys(updateFields).forEach(field => {
      rates[field] = updateFields[field];
    });

    await rates.save();

    res.status(200).json({ message: "Rate table updated successfully", rates: rates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createRatetable, getRatetable, getRates, updateRatetable };
