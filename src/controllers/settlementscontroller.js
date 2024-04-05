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
      eur_no_of_refund,
      usd_no_of_refund,
      eur_refund_amount,
      usd_refund_amount,
      eur_no_of_chargeback,
      usd_no_of_chargeback,
      eur_chargeback_amount,
      usd_chargeback_amount,
      eur_to_usd_exc_rate,
      usd_to_eur_exc_rate,
    } = req.body;
    console.log("from", fromDate);
    console.log("to", toDate);
    var [year, month, day] = fromDate.substring(0, 10).split("-");
    const formattedfromDate = `${day}/${month}/${year} 00:00:00`;

    [year, month, day] = toDate.substring(0, 10).split("-");
    const formattedtoDate = `${day}/${month}/${year} 23:59:59`;

    //All transactions of Company between from and to date
    const all_txn_of_company = await Transactiontable.find({
      merchant: company_name,
      transactiondate: {
        $gte: formattedfromDate,
        $lte: formattedtoDate,
      },
    });

    //Extract rates of the company
    const rates = await Ratetable.findOne({ company_name: company_name });
    MDR = rates.MDR;
    RR = rates.RR;
    settlement_fee = rates.settlement_fee;

    if (rates.currency === "EUR") {
      //Rates for EURO (as it is)
      eur_txn_app = rates.txn_app;
      eur_txn_dec = rates.txn_dec;
      eur_refund_fee = rates.refund_fee;
      eur_chargeback_fee = rates.chargeback_fee;

      //Rates for USD (convert EUR to USD)

      usd_txn_app = rates.txn_app * eur_to_usd_exc_rate;
      usd_txn_dec = rates.txn_dec * eur_to_usd_exc_rate;

      usd_refund_fee = rates.refund_fee * eur_to_usd_exc_rate;
      usd_chargeback_fee = rates.chargeback_fee * eur_to_usd_exc_rate;
    } else {
      //Rates for EURO (convert usd to eur)
      eur_txn_app = rates.txn_app * usd_to_eur_exc_rate;
      eur_txn_dec = rates.txn_dec * usd_to_eur_exc_rate;
      eur_refund_fee = rates.refund_fee * usd_to_eur_exc_rate;
      eur_chargeback_fee = rates.chargeback_fee * usd_to_eur_exc_rate;

      //Rates for USD (As it is)
      usd_txn_app = rates.txn_app;
      usd_txn_dec = rates.txn_dec;
      usd_refund_fee = rates.refund_fee;
      usd_chargeback_fee = rates.chargeback_fee;
    }

    //EUR calculations

    //Euro transactions of Company
    const all_eur_txn = all_txn_of_company.filter(
      (transaction) => transaction.currency === "EUR"
    );

    //Approved and Declined EUR txns
    const { eur_app_txn, eur_dec_txn } = all_eur_txn.reduce(
      (all_txn_of_company, transaction) => {
        if (transaction.Status === "Success") {
          all_txn_of_company.eur_app_txn.push(transaction);
        } else if (transaction.Status === "Failed") {
          all_txn_of_company.eur_dec_txn.push(transaction);
        }
        return all_txn_of_company;
      },
      { eur_app_txn: [], eur_dec_txn: [] }
    );

    //EUR Approved count
    const eur_app_count = eur_app_txn.length;
    //EUR Approved Volume
    let eur_app_vol = parseFloat(
      eur_app_txn.reduce((total, txn) => total + txn.amount, 0).toFixed(3)
    );

    //EUR Declined count
    const eur_dec_count = eur_dec_txn.length;
    //EUR Declined Volume
    let eur_dec_vol = parseFloat(
      eur_dec_txn.reduce((total, txn) => total + txn.amount, 0).toFixed(3)
    );

    //EUR total volumes
    const eur_total_vol = parseFloat((eur_app_vol + eur_dec_vol).toFixed(3));

    //Fess calculation
    let eur_MDR_amount = parseFloat((eur_total_vol * (MDR / 100)).toFixed(3));
    let eur_app_amount = parseFloat((eur_app_count * eur_txn_app).toFixed(3));
    let eur_dec_amount = parseFloat((eur_dec_count * eur_txn_dec).toFixed(3));
    let eur_RR_amount = parseFloat((eur_total_vol * (RR / 100)).toFixed(3));

    let eur_amt_after_fees = parseFloat(
      (
        eur_total_vol -
        eur_MDR_amount -
        eur_app_amount -
        eur_dec_amount -
        eur_RR_amount
      ).toFixed(3)
    );

    let eur_settlement_fee_amount = parseFloat(
      (eur_amt_after_fees * (settlement_fee / 100)).toFixed(3)
    );

    let eur_settlement_amount = parseFloat(
      (eur_amt_after_fees - eur_settlement_fee_amount).toFixed(3)
    );

    let eur_total_refund_amount =
      parseFloat(eur_no_of_refund) * eur_refund_fee +
      parseFloat(eur_refund_amount);
    let eur_total_chargeback_amount =
      parseFloat(eur_no_of_chargeback) * eur_chargeback_fee +
      parseFloat(eur_chargeback_amount);

    const eur_settlement_vol =
      eur_settlement_amount -
      eur_total_refund_amount -
      eur_total_chargeback_amount;

    const eur_to_usd_settlement_vol = parseFloat(
      (eur_settlement_vol * eur_to_usd_exc_rate).toFixed(3)
    );

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    //USD calculations

    //USD transactions of Company
    const all_usd_txn = all_txn_of_company.filter(
      (transaction) => transaction.currency === "USD"
    );

    //Approved and Declined USD txns
    const { usd_app_txn, usd_dec_txn } = all_usd_txn.reduce(
      (all_txn_of_company, transaction) => {
        if (transaction.Status === "Success") {
          all_txn_of_company.usd_app_txn.push(transaction);
        } else if (transaction.Status === "Failed") {
          all_txn_of_company.usd_dec_txn.push(transaction);
        }
        return all_txn_of_company;
      },
      { usd_app_txn: [], usd_dec_txn: [] }
    );

    //USD Approved count
    const usd_app_count = usd_app_txn.length;

    //USD Approved Volume
    let usd_app_vol = parseFloat(
      usd_app_txn.reduce((total, txn) => total + txn.amount, 0).toFixed(3)
    );

    //USD Declined count
    const usd_dec_count = usd_dec_txn.length;
    //USD Declined Volume
    let usd_dec_vol = parseFloat(
      usd_dec_txn.reduce((total, txn) => total + txn.amount, 0).toFixed(3)
    );

    //USD total volumes
    const usd_total_vol = parseFloat((usd_app_vol + usd_dec_vol).toFixed(3));

    //Fess calculation
    let usd_MDR_amount = parseFloat((usd_total_vol * (MDR / 100)).toFixed(3));
    let usd_app_amount = parseFloat((usd_app_count * usd_txn_app).toFixed(3));
    let usd_dec_amount = parseFloat((usd_dec_count * usd_txn_dec).toFixed(3));
    let usd_RR_amount = parseFloat((usd_total_vol * (RR / 100)).toFixed(3));

    let usd_amt_after_fees = parseFloat(
      (
        usd_total_vol -
        usd_MDR_amount -
        usd_app_amount -
        usd_dec_amount -
        usd_RR_amount
      ).toFixed(3)
    );

    let usd_settlement_fee_amount = parseFloat(
      (usd_amt_after_fees * (settlement_fee / 100)).toFixed(3)
    );

    let usd_settlement_amount = parseFloat(
      (usd_amt_after_fees - usd_settlement_fee_amount).toFixed(3)
    );

    let usd_total_refund_amount =
      parseFloat(usd_no_of_refund) * usd_refund_fee +
      parseFloat(usd_refund_amount);
    let usd_total_chargeback_amount =
      parseFloat(usd_no_of_chargeback) * usd_chargeback_fee +
      parseFloat(usd_chargeback_amount);

    const usd_settlement_vol =
      usd_settlement_amount -
      usd_total_refund_amount -
      usd_total_chargeback_amount;

    const total_settlement_volume = parseFloat(
      (eur_to_usd_settlement_vol + usd_settlement_vol).toFixed(3)
    );

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
      fromDate: formattedfromDate.substring(0, 10),
      toDate: formattedtoDate.substring(0, 10),
      eur_app_count,
      eur_dec_count,
      usd_app_count,
      usd_dec_count,
      eur_app_vol,
      eur_dec_vol,
      usd_app_vol,
      usd_dec_vol,
      eur_MDR_amount,
      eur_app_amount,
      eur_dec_amount,
      eur_RR_amount,
      usd_MDR_amount,
      usd_app_amount,
      usd_dec_amount,
      usd_RR_amount,
      eur_settlement_fee_amount,
      usd_settlement_fee_amount,
      eur_settlement_amount,
      usd_settlement_amount,
      eur_no_of_refund,
      eur_refund_amount,
      eur_total_refund_amount,
      eur_no_of_chargeback,
      eur_chargeback_amount,
      eur_total_chargeback_amount,
      usd_no_of_refund,
      usd_refund_amount,
      usd_total_refund_amount,
      usd_no_of_chargeback,
      usd_chargeback_amount,
      usd_total_chargeback_amount,
      date_settled: formattedSettlementDate,
      eur_settlement_vol,
      eur_to_usd_settlement_vol,
      usd_settlement_vol,
    });

    await settlement_record.save();

    res.status(201).json({
      success: true,
      settlement_record,
    });
    await Client.updateOne(
      { company_name: company_name },
      { last_settled_date: formattedSettlementDate }
    );
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

async function updateSettlement(req, res) {
  try {
    const { id, status } = req.body;

    const existingSettlement = await Settlementtable.findById(id);
    if (!existingSettlement) {
      return res.status(404).json({ error: "Settlement not found" });
    }
    if (status) {
      existingSettlement.status = status;
    }

    const updatedSettlement = await existingSettlement.save();

    res.status(200).json({
      message: "Settlement Updated successfully",
      settlement_record: updatedSettlement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getSettlementRecordforPDF(req, res) {
  try {
    const id = req.query.id;
    const record = await Settlementtable.findById(id);
    console.log(record);
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
