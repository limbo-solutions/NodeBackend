require("../config/database");
const Ratetable = require("../models/Ratetable");
const Settlementtable = require("../models/Settlementtable");
const Transactiontable = require("../models/Transactiontable");
const Client = require("../models/Client");

async function createSettlement(req, res) {
  try {
    const { fromDate, toDate, company_name } = req.body;
    console.log(fromDate);
    console.log(toDate);
    const fromDateWithTime = fromDate + " 00:00:00";
    const toDateWithTime = toDate + " 23:59:59";

    const result = await Transactiontable.find({
      merchant: company_name,
      transactiondate: { $gte: fromDateWithTime, $lte: toDateWithTime },
    });
    const entity = await Client.findOne({ company_name: company_name });

    const success_result = await Transactiontable.find({
      merchant: company_name,
      transactiondate: { $gte: fromDateWithTime, $lte: toDateWithTime },
      Status: "Success",
    });
    const total_volume = success_result.reduce(
      (total, txn) => total + txn.amount,
      0
    );
    console.log(total_volume);

    const rates = await Ratetable.findOne({ company_name: company_name });

    if (entity) {
      let settlement_amount;
      if (rates.settlement_scheme === "Total") {
        const no_of_txn = result.length;
        console.log(no_of_txn);
        let val =
          total_volume -
          total_volume * (rates.MDR / 100) -
          no_of_txn * rates.txn_total -
          total_volume * (rates.RR / 100);
        console.log(val);
        let s_val = val * (rates.settlement_fee / 100);
        console.log(s_val);
        settlement_amount = val - s_val;
        console.log(settlement_amount);
      } else {
        const failure_result = await Transactiontable.find({
          merchant: company_name,
          transactiondate: { $gte: fromDateWithTime, $lte: toDateWithTime },
          Status: "Failed",
        });
        const success_txn = success_result.length;
        const failure_txn = failure_result.length;
        console.log(success_txn);
        console.log(failure_txn);
        let val =
          total_volume -
          total_volume * (rates.MDR / 100) -
          (success_txn * rates.txn_app + failure_txn * rates.txn_dec) -
          total_volume * (rates.RR / 100);
        console.log(val);
        let s_val = val * (rates.settlement_fee / 100);
        console.log(s_val);
        settlement_amount = val - s_val;
        console.log(settlement_amount);
      }

      const settlementDate = new Date();

      const formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
        -2
      )}/${("0" + (settlementDate.getMonth() + 1)).slice(
        -2
      )}/${settlementDate.getFullYear()}`;

      // Create a new instance of SettlementRecord with date_settled assigned

      const settlement_record = new Settlementtable({
        company_name: company_name,
        date_settled: formattedSettlementDate,
        total_volume: total_volume,
        settlement_volume: settlement_amount,
      });

      await settlement_record.save();

      await Client.updateOne(
        {company_name:company_name},
        { last_settled_date: formattedSettlementDate }
      );

      res
        .status(201)
        .json({ success: true, settlement_record: settlement_record });
    } else {
      res.status(422).json({
        errors: ["Client not found for company_name: " + company_name],
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getSettlement(req, res) {
  try {
    const company_name = req.query.company_name;
    if (!company_name) {
      return res.status(400).json({ error: "Company name is required" });
    }
    const records = await Settlementtable.find({
      company_name: company_name,
    }).sort({
      date_settled: -1,
    });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateSettlement(req,res) {
  try {
    const { id, status } = req.body

    const existingSettlement = await Settlementtable.findById(id);
    if (!existingSettlement) {
      return res.status(404).json({ error: "Settlement not found" });
    }

    if( status ) {
      existingSettlement.status = status;
    }

    const updatedSettlement = await existingSettlement.save();

    res.status(200).json ({
      message: "Settlement Updated successfully",
      settlement_record: updatedSettlement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error"});
  }
}

module.exports = { createSettlement, getSettlement, updateSettlement };
