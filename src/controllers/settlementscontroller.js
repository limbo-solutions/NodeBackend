require("../config/database");
const Ratetable = require("../models/Ratetable");
const Settlementtable = require("../models/Settlementtable");
const Transactiontable = require("../models/Transactiontable");
const Client = require("../models/Client");

async function createSettlement(req, res) {
  try {
    const {
      fromDate,
      toDate,
      company_name,
      no_of_refund,
      no_of_chargeback,
      exchange_rate,
    } = req.body;
    const fromDateWithTime = fromDate + " 00:00:00";
    const toDateWithTime = toDate + " 23:59:59";

    //All transactions of Delasport between from and to date
    const result = await Transactiontable.find({
      merchant: company_name,
      transactiondate: { $gte: fromDateWithTime, $lte: toDateWithTime },
    });

    //Rates of Delasport
    const rates = await Ratetable.findOne({ company_name: company_name });

    // Transactions done in EUR
    const eur_sales = result.filter(
      (transaction) =>
        transaction.currency === "EUR" && transaction.Status === "Success"
    );

    let eur_sales_count = eur_sales.length;
    let eur_sales_amount = parseFloat(
      (
        eur_sales.reduce((total, txn) => total + txn.amount, 0) * exchange_rate
      ).toFixed(3)
    );

<<<<<<< HEAD
      const formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
        -2
      )}/${("0" + (settlementDate.getMonth() + 1)).slice(
        -2
      )}/${settlementDate.getFullYear()}`;
=======
    const eur_declines = result.filter(
      (transaction) =>
        transaction.currency === "EUR" && transaction.Status === "Failed"
    );
>>>>>>> 51caf5f8106a5a1a6fd2e3672efd73eb2ff93cb6

    let eur_declines_count = eur_declines.length;
    let eur_declines_amount = parseFloat(
      (
        eur_declines.reduce((total, txn) => total + txn.amount, 0) *
        exchange_rate
      ).toFixed(3)
    );

    // Transactions done in USD
    const usd_sales = result.filter(
      (transaction) =>
        transaction.currency === "USD" && transaction.Status === "Success"
    );

    let usd_sales_count = usd_sales.length;
    let usd_sales_amount = parseFloat(
      usd_sales.reduce((total, txn) => total + txn.amount, 0).toFixed(3)
    );

<<<<<<< HEAD
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
=======
    const usd_declines = result.filter(
      (transaction) =>
        transaction.currency === "USD" && transaction.Status === "Failed"
    );

    let usd_declines_count = usd_declines.length;
    let usd_declines_amount = parseFloat(
      usd_declines.reduce((total, txn) => total + txn.amount, 0).toFixed(3)
    );

    let total_sales_count = eur_sales_count + usd_sales_count;
    let total_declines_count = eur_declines_count + usd_declines_count;
    let total_sales_amount = parseFloat(
      (eur_sales_amount + usd_sales_amount).toFixed(3)
    );
    let total_declines_amount = parseFloat(
      (eur_declines_amount + usd_declines_amount).toFixed(3)
    );

    const total_volume = total_sales_amount + total_declines_amount;
    console.log("Total volume", total_volume);
    let MDR = rates.MDR;
    let txn_app = rates.txn_app;
    let txn_dec = rates.txn_dec;
    let RR = rates.RR;
    let refund_fee = rates.refund_fee;
    let chargeback_fee = rates.chargeback_fee;
    let settlement_fee = rates.settlement_fee;
    let MDR_amount = parseFloat((total_volume * (MDR / 100)).toFixed(3));
    let app_amount = parseFloat((total_sales_count * txn_app).toFixed(3));
    let dec_amount = parseFloat((total_declines_count * txn_dec).toFixed(3));
    let RR_amount = parseFloat((total_volume * (RR / 100)).toFixed(3));
    let val = parseFloat(
      (
        total_volume -
        MDR_amount -
        (app_amount + dec_amount) -
        RR_amount
      ).toFixed(3)
    );
    console.log(val);
    let s_val = parseFloat((val * (settlement_fee / 100)).toFixed(3));
    total_fee = MDR_amount + app_amount + dec_amount + RR_amount + s_val;
    settlement_amount = parseFloat((val - s_val).toFixed(3));
    console.log(settlement_amount);

    let refund_amount = no_of_refund * refund_fee;
    let chargeback_amount = no_of_chargeback * chargeback_fee;
    const settlementDate = new Date();

    // Format the settlement date as dd/mm/yyyy
    const formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
      -2
    )}/${("0" + (settlementDate.getMonth() + 1)).slice(
      -2
    )}/${settlementDate.getFullYear()}`;

    // Create a new instance of SettlementRecord with date_settled assigned

    const settlement_record = new Settlementtable({
      company_name,
      fromDate,
      toDate,
      eur_sales_count,
      eur_declines_count,
      usd_sales_count,
      usd_declines_count,
      total_sales_count,
      total_declines_count,
      total_sales_amount,
      total_declines_amount,
      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      s_val,
      total_fee,
      date_settled: formattedSettlementDate,
      settlement_volume: settlement_amount,
      refund_amount,
      chargeback_amount,
    });

    await settlement_record.save();

    res.status(201).json({
      success: true,
      settlement_record,
    });
>>>>>>> 51caf5f8106a5a1a6fd2e3672efd73eb2ff93cb6
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

<<<<<<< HEAD
async function updateSettlement(req,res) {
  try {
    const { id, status } = req.body
=======
async function updateSettlement(req, res) {
  try {
    const { id, status } = req.body;
>>>>>>> 51caf5f8106a5a1a6fd2e3672efd73eb2ff93cb6

    const existingSettlement = await Settlementtable.findById(id);
    if (!existingSettlement) {
      return res.status(404).json({ error: "Settlement not found" });
    }

<<<<<<< HEAD
    if( status ) {
=======
    if (status) {
>>>>>>> 51caf5f8106a5a1a6fd2e3672efd73eb2ff93cb6
      existingSettlement.status = status;
    }

    const updatedSettlement = await existingSettlement.save();

<<<<<<< HEAD
    res.status(200).json ({
=======
    res.status(200).json({
>>>>>>> 51caf5f8106a5a1a6fd2e3672efd73eb2ff93cb6
      message: "Settlement Updated successfully",
      settlement_record: updatedSettlement,
    });
  } catch (error) {
    console.error(error);
<<<<<<< HEAD
    res.status(500).json({ error: "Internal server error"});
  }
}

module.exports = { createSettlement, getSettlement, updateSettlement };
=======
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getSettlementRecordforPDF(req, res) {
  try {
    const id = req.query.id;
    const record = await Settlementtable.findById(id);
    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createSettlement,
  getSettlement,
  updateSettlement,
  getSettlementRecordforPDF,
};
>>>>>>> 51caf5f8106a5a1a6fd2e3672efd73eb2ff93cb6
