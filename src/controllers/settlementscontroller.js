require("../config/database");
const nodemailer = require("nodemailer");

const Ratetable = require("../models/Ratetable");
const Settlementtable = require("../models/Settlementtable");
const LiveTransactionTable = require("../models/LiveTransactionTable");
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
      conversion_in_usdt,
      total_amount_in_usdt,
      note,
    } = req.body;

    const newfromDate = fromDate.replace("T"," ");
    const newtoDate = toDate.replace("T"," ")
    const refund_count = parseFloat(eur_no_of_refund + usd_no_of_refund);
    console.log(refund_count);
    const chargeback_count = parseFloat(
      eur_no_of_chargeback + usd_no_of_chargeback
    );
    console.log(chargeback_count);
    const refund_amount = eur_refund_amount + usd_refund_amount;

    console.log(refund_amount);
    const chargeback_amount = eur_chargeback_amount + usd_chargeback_amount;
    console.log(chargeback_amount);

    const client_data = await Client.findOne({ company_name });
    const rates = await Ratetable.findOne({ company_name: company_name });

    const all_txn_of_company = await LiveTransactionTable.aggregate([
      {
          $match: {
              merchant: company_name,
              transactiondate: {
                  $gte: newfromDate,
                  $lte: newtoDate,
              },
          },
      },
      {
          $group: {
              _id: { currency: "$currency", status: "$Status" },
              totalTransactions: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
          },
      },
      {
          $group: {
              _id: "$_id.currency",
              statuses: {
                  $push: {
                      status: "$_id.status",
                      totalTransactions: "$totalTransactions",
                      totalAmount: "$totalAmount"
                  }
              }
          }
      }
  ]);

    console.log(all_txn_of_company);

    let app_count = 0;
    let app_vol = 0;
    let dec_count = 0;
    let dec_vol = 0;
    let usd_app_count = 0;
    let usd_dec_count = 0;
    let eur_app_count = 0;
    let eur_dec_count = 0;

    all_txn_of_company.forEach((currencyGroup) => {
      const status = currencyGroup.statuses;
      const currency = currencyGroup._id;

      status.forEach((statusGroup) => {
          const { totalTransactions, totalAmount } = statusGroup;

          if (currency === "USD") {
              if (statusGroup.status === "Success") {
                  usd_app_count += totalTransactions;
                  app_vol += totalAmount;
              } else if (statusGroup.status === "Failed" || statusGroup.status === "Incompleted") {
                  usd_dec_count += totalTransactions;
                  dec_vol += totalAmount;
              }
          } else if (currency === "EUR") {
              if (statusGroup.status === "Success") {
                  eur_app_count += totalTransactions;
                  app_vol += totalAmount;
              } else if (statusGroup.status === "Failed" || statusGroup.status === "Incompleted") {
                  eur_dec_count += totalTransactions;
                  dec_vol += totalAmount;
              }
          }

          console.log(`Currency: ${currency}, Status: ${statusGroup.status}, Total Transactions: ${totalTransactions}, Total Amount: ${totalAmount}`);
      });
  });

  app_count = eur_app_count + usd_app_count;
  dec_count = eur_dec_count + usd_dec_count;

  console.table({ app_count, dec_count, app_vol, dec_vol, usd_app_count, usd_dec_count, eur_app_count, eur_dec_count });

    const MDR_amount = parseFloat((app_vol * (rates.MDR / 100)).toFixed(3));
    const app_amount = parseFloat((app_count * rates.txn_app).toFixed(3));
    const dec_amount = parseFloat((dec_count * rates.txn_dec).toFixed(3));
    const RR_amount = parseFloat((app_vol * (rates.RR / 100)).toFixed(3));

    const amt_after_fees = parseFloat(
      (app_vol - MDR_amount - app_amount - dec_amount - RR_amount).toFixed(3)
    );

    const settlement_fee_amount = parseFloat(
      (amt_after_fees * (rates.settlement_fee / 100)).toFixed(3)
    );

    const settlement_amount = parseFloat(
      (amt_after_fees - settlement_fee_amount).toFixed(3)
    );

    const total_refund_amount =
      parseFloat(refund_count) * rates.refund_fee + parseFloat(refund_amount);

    const total_chargeback_amount =
      parseFloat(chargeback_count) * rates.chargeback_fee +
      parseFloat(chargeback_amount);

    const settlement_vol = parseFloat(
      (
        settlement_amount -
        total_refund_amount -
        total_chargeback_amount
      ).toFixed(3)
    );
    console.table([
      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      settlement_fee_amount,
      total_refund_amount,
      total_chargeback_amount,
      settlement_vol,
    ]);

    const settlementDate = new Date().toISOString().split("T")[0];

    const report_id = await calculateReportID(client_data.client_id);
    settlement_record = {
      client_id: client_data["client_id"],
      report_id,
      company_name,
      fromDate: newfromDate,
      toDate: newtoDate,
      total_vol: app_vol,
      eur_app_count,
      eur_dec_count,
      usd_app_count,
      usd_dec_count,
      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      settlement_fee_amount,
      eur_no_of_refund,
      usd_no_of_refund,
      eur_refund_amount,
      usd_refund_amount,
      eur_no_of_chargeback,
      usd_no_of_chargeback,
      eur_chargeback_amount,
      usd_chargeback_amount,
      total_refund_amount,
      total_chargeback_amount,
      date_settled: settlementDate,
      settlement_vol,
      conversion_in_usdt,
      total_amount_in_usdt,
      note,
    };

    const settlementRecordInstance = new Settlementtable(settlement_record);
    await settlementRecordInstance.save();
console.log("Record saved")
    res.status(201).json({
      success: true,
      settlement_record,
    });
    await Client.updateOne(
      { company_name: company_name },
      { last_settled_date: settlementDate }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function previewSettlement(req, res) {
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
      conversion_in_usdt,
      total_amount_in_usdt,
      note,
    } = req.body;


const newfromDate = fromDate.replace("T"," ");
const newtoDate = toDate.replace("T"," ")
console.log(fromDate)
console.log(toDate)
console.log(newfromDate)
console.log(newtoDate)
    const refund_count = parseFloat(eur_no_of_refund + usd_no_of_refund);
    console.log(refund_count);
    const chargeback_count = parseFloat(
      eur_no_of_chargeback + usd_no_of_chargeback
    );
    console.log(chargeback_count);
    const refund_amount = eur_refund_amount + usd_refund_amount;

    console.log(refund_amount);
    const chargeback_amount = eur_chargeback_amount + usd_chargeback_amount;
    console.log(chargeback_amount);

    const client_data = await Client.findOne({ company_name });
    const rates = await Ratetable.findOne({ company_name: company_name });

    const all_txn_of_company = await LiveTransactionTable.aggregate([
      {
          $match: {
              merchant: company_name,
              transactiondate: {
                  $gte: newfromDate,
                  $lte: newtoDate,
              },
          },
      },
      {
          $group: {
              _id: { currency: "$currency", status: "$Status" },
              totalTransactions: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
          },
      },
      {
          $group: {
              _id: "$_id.currency",
              statuses: {
                  $push: {
                      status: "$_id.status",
                      totalTransactions: "$totalTransactions",
                      totalAmount: "$totalAmount"
                  }
              }
          }
      }
  ]);

    console.log(all_txn_of_company);

    let app_count = 0;
    let app_vol = 0;
    let dec_count = 0;
    let dec_vol = 0;
    let usd_app_count = 0;
    let usd_dec_count = 0;
    let eur_app_count = 0;
    let eur_dec_count = 0;

    all_txn_of_company.forEach((currencyGroup) => {
      const status = currencyGroup.statuses;
      const currency = currencyGroup._id;

      status.forEach((statusGroup) => {
          const { totalTransactions, totalAmount } = statusGroup;

          if (currency === "USD") {
              if (statusGroup.status === "Success") {
                  usd_app_count += totalTransactions;
                  app_vol += totalAmount;
              } else if (statusGroup.status === "Failed" || statusGroup.status === "Incompleted") {
                  usd_dec_count += totalTransactions;
                  dec_vol += totalAmount;
              }
          } else if (currency === "EUR") {
              if (statusGroup.status === "Success") {
                  eur_app_count += totalTransactions;
                  app_vol += totalAmount;
              } else if (statusGroup.status === "Failed" || statusGroup.status === "Incompleted") {
                  eur_dec_count += totalTransactions;
                  dec_vol += totalAmount;
              }
          }

          console.log(`Currency: ${currency}, Status: ${statusGroup.status}, Total Transactions: ${totalTransactions}, Total Amount: ${totalAmount}`);
      });
  });

  app_count = eur_app_count + usd_app_count;
  dec_count = eur_dec_count + usd_dec_count;

  console.table({ app_count, dec_count, app_vol, dec_vol, usd_app_count, usd_dec_count, eur_app_count, eur_dec_count });

    const MDR_amount = parseFloat((app_vol * (rates.MDR / 100)).toFixed(3));
    const app_amount = parseFloat((app_count * rates.txn_app).toFixed(3));
    const dec_amount = parseFloat((dec_count * rates.txn_dec).toFixed(3));
    const RR_amount = parseFloat((app_vol * (rates.RR / 100)).toFixed(3));

    const amt_after_fees = parseFloat(
      (app_vol - MDR_amount - app_amount - dec_amount - RR_amount).toFixed(3)
    );

    const settlement_fee_amount = parseFloat(
      (amt_after_fees * (rates.settlement_fee / 100)).toFixed(3)
    );

    const settlement_amount = parseFloat(
      (amt_after_fees - settlement_fee_amount).toFixed(3)
    );

    const total_refund_amount =
      parseFloat(refund_count) * rates.refund_fee + parseFloat(refund_amount);

    const total_chargeback_amount =
      parseFloat(chargeback_count) * rates.chargeback_fee +
      parseFloat(chargeback_amount);

    const settlement_vol = parseFloat(
      (
        settlement_amount -
        total_refund_amount -
        total_chargeback_amount
      ).toFixed(3)
    );
    console.table([
      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      settlement_fee_amount,
      total_refund_amount,
      total_chargeback_amount,
      conversion_in_usdt,
      total_amount_in_usdt,
      settlement_vol,
    ]);

    const settlementDate = new Date().toISOString().split("T")[0];

    settlement_record = {
      client_id: client_data["client_id"],
      company_name,
      fromDate: newfromDate,
      toDate: newtoDate,
      total_vol: app_vol,
      eur_app_count,
      eur_dec_count,
      usd_app_count,
      usd_dec_count,
      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      settlement_fee_amount,
      eur_no_of_refund,
      usd_no_of_refund,
      eur_refund_amount,
      usd_refund_amount,
      eur_no_of_chargeback,
      usd_no_of_chargeback,
      eur_chargeback_amount,
      usd_chargeback_amount,
      total_refund_amount,
      total_chargeback_amount,
      date_settled: settlementDate,
      settlement_vol,
      conversion_in_usdt,
      total_amount_in_usdt,
      note,
    };
    res.status(201).json({
      success: true,
      settlement_record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function calculateReportID(client_id) {
  const lastRecord = await Settlementtable.aggregate([
    { $match: { client_id } },
    {
      $addFields: {
        reportNumber: {
          $substr: [
            "$report_id",
            { $subtract: [{ $strLenCP: "$report_id" }, 2] },
            2,
          ],
        },
      },
    },
    {
      $group: {
        _id: "$client_id",
        maxReportNumber: { $max: { $toInt: "$reportNumber" } },
      },
    },
  ]);

  let nextReportNumber = 1;
  if (lastRecord.length > 0) {
    nextReportNumber = lastRecord[0].maxReportNumber + 1;
  }
  const reportNumberPadded = nextReportNumber.toString().padStart(2, "0");
  const report_id = `${client_id}${reportNumberPadded}`;
  return report_id;
}

async function getSettlement(req, res) {
  try {
    const company_name = req.query.company_name;
    if (!company_name) {
      return res.status(400).json({ error: "Company name is required" });
    }
    const records = await Settlementtable.find({
      company_name: company_name,
    })
      .sort({
        date_settled: -1,
      })
      .select(
        "client_id report_id total_vol settlement_vol status date_settled"
      );

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

const transporters = {
  'no.reply.centpays@gmail.com': nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "no.reply.centpays@gmail.com",
      pass: "hkbm gogq vyni fzfy",
    },
  }),
  'sakinashahid2102@gmail.com': nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "sakinashahid2102@gmail.com",
      pass: "jhwp ifvs hryh rwrn",
    },
  }),
};

async function sendEmail(req, res) {
  const { fromEmail, toEmail, ccEmail, subject, message } = req.body;
  const attachment = req.file;

  try {
    const selectedTransporter = transporters[fromEmail];
    if (!selectedTransporter) {
      return res.status(400).json({ message: "Invalid fromEmail" });
    }

    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      cc: ccEmail,
      subject: subject,
      text: message,
      attachments: attachment
        ? [
            {
              filename: attachment.originalname,
              contentType: attachment.mimetype,
              path: attachment.path,
            },
          ]
        : [],
    };

    const info = await selectedTransporter.sendMail(mailOptions);

    console.log("Email sent successfully:");
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// async function sendEmail(req, res) {
//   const { fromEmail, toEmail, ccEmail, subject, message, password } = req.body;
//   const attachment = req.file;

//   try {
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: fromEmail,
//         pass: password,
//       },
//     });

//     const mailOptions = {
//       from: fromEmail,
//       to: toEmail,
//       cc: ccEmail,
//       subject: subject,
//       text: message,
//       attachments: attachment
//         ? [
//             {
//               filename: attachment.originalname,
//               contentType: attachment.mimetype,
//               path: attachment.path,
//             },
//           ]
//         : [],
//     };

//     const info = await transporter.sendMail(mailOptions);

//     console.log("Email sent successfully:");
//     res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

async function getCounts(req, res) {
  try {
    const { company_name, fromDate, toDate } = req.body;

    var [year, month, day] = fromDate.substring(0, 10).split("-");
    const formattedfromDate = `${day}/${month}/${year} 00:00:00`;

    [year, month, day] = toDate.substring(0, 10).split("-");
    const formattedtoDate = `${day}/${month}/${year} 23:59:59`;

    const all_txn_of_company = await LiveTransactionTable.find({
      merchant: company_name,
      transactiondate: {
        $gte: formattedfromDate,
        $lte: formattedtoDate,
      },
    });

    currencies_data = await Client.findOne({ company_name });
    currencies = currencies_data["currency"];

    const app_dec_calculation = {};
    currencies.forEach((currency) => {
      app_dec_calculation[currency] = calculateAppDecValues(
        all_txn_of_company,
        currency
      );
    });

    res.json(app_dec_calculation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to calculate currency values" });
  }
}

function calculateAppDecValues(transactions, currency) {
  const currency_txn = transactions.filter(
    (transaction) => transaction.currency === currency
  );

  const { approved_txns, declined_txns } = currency_txn.reduce(
    (result, transaction) => {
      if (transaction.Status === "Success") {
        result.approved_txns.push(transaction);
      } else if (transaction.Status === "Failed") {
        result.declined_txns.push(transaction);
      }
      return result;
    },
    { approved_txns: [], declined_txns: [] }
  );

  const approved_count = approved_txns.length;
  const declined_count = declined_txns.length;
  return {
    approved_count,
    declined_count,
  };
}

async function deleteSettlement(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ error: "ID is required in the request body" });
    }

    const deletedSettlement = await Settlementtable.findByIdAndDelete(_id);

    if (!deletedSettlement) {
      return res.status(404).json({ error: "Settlement not found" });
    }

    res.status(200).json({ success: true, message: "Settlement deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function manualSettlements(req, res) {
  try {
    const {
      fromDate,
      toDate,
      company_name,
      app_vol,
      usd_app_count,
      usd_dec_count,
      usd_no_of_refund,
      usd_no_of_chargeback,
      usd_refund_amount,
      usd_chargeback_amount,
      eur_app_count,
      eur_dec_count,
      eur_no_of_refund,
      eur_no_of_chargeback,
      eur_refund_amount,
      eur_chargeback_amount,
      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      settlement_fee_amount,
      total_refund_amount,
      total_chargeback_amount,
      eur_to_usd_exc_rate,
      usd_to_eur_exc_rate,
      settlement_vol,
      conversion_in_usdt,
      total_amount_in_usdt,
      note,
    } = req.body;

    const settlementDate = new Date().toISOString().split("T")[0];

    const client_data = await Client.findOne({ company_name });
    const report_id = await calculateReportID(client_data.client_id);

    const settlement = new Settlementtable({
      client_id: client_data["client_id"],
      report_id,
      fromDate,
      toDate,
      company_name,
      app_vol,
      usd_app_count,
      usd_dec_count,
      usd_no_of_refund,
      usd_no_of_chargeback,
      usd_refund_amount,
      usd_chargeback_amount,
      eur_app_count,
      eur_dec_count,
      eur_no_of_refund,
      eur_no_of_chargeback,
      eur_refund_amount,
      eur_chargeback_amount,
      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      settlement_fee_amount,
      total_refund_amount,
      total_chargeback_amount,
      eur_to_usd_exc_rate,
      usd_to_eur_exc_rate,
      settlement_vol,
      date_settled: settlementDate,
      conversion_in_usdt,
      total_amount_in_usdt,
      note,
    });

    await settlement.save()

    res.status(201).json({
      message: "Settlement created successully",
      settlement: settlement,
    });

    await Client.updateOne(
      { company_name: company_name },
      { last_settled_date: settlementDate }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function semimanualSettlements (req, res){
  try {
    const {
      fromDate,
      toDate,
      company_name,
      app_vol,
      usd_app_count,
      usd_dec_count,
      usd_no_of_refund,
      usd_no_of_chargeback,
      usd_refund_amount,
      usd_chargeback_amount,
      eur_app_count,
      eur_dec_count,
      eur_no_of_refund,
      eur_no_of_chargeback,
      eur_refund_amount,
      eur_chargeback_amount,
      eur_to_usd_exc_rate,
      usd_to_eur_exc_rate,
      conversion_in_usdt,
      total_amount_in_usdt,
      note,
    } = req.body;

    const client_data = await Client.findOne({ company_name });
    const rates = await Ratetable.findOne({ company_name: company_name });

    const refund_count = parseFloat(eur_no_of_refund + usd_no_of_refund);
    const chargeback_count = parseFloat(eur_no_of_chargeback + usd_no_of_chargeback);

    const refund_amount = parseFloat(eur_refund_amount + usd_refund_amount);
    const chargeback_amount = parseFloat(eur_chargeback_amount + usd_chargeback_amount);

    const settlementDate = new Date().toISOString().split("T")[0];

    const app_count = parseFloat(eur_app_count + usd_app_count);
    const dec_count = parseFloat(eur_dec_count + usd_dec_count);

    const MDR_amount = parseFloat((app_vol * (rates.MDR / 100)).toFixed(3));
    const app_amount = parseFloat((app_count * rates.txn_app).toFixed(3));
    const dec_amount = parseFloat((dec_count * rates.txn_dec).toFixed(3));
    const RR_amount = parseFloat((app_vol * (rates.RR / 100)).toFixed(3));

    const amt_after_fees = parseFloat(
      (app_vol - MDR_amount - app_amount - dec_amount - RR_amount).toFixed(3)
    );

    const settlement_fee_amount = parseFloat(
      (amt_after_fees * (rates.settlement_fee / 100)).toFixed(3)
    );

    const settlement_amount = parseFloat(
      (amt_after_fees - settlement_fee_amount).toFixed(3)
    );

    const total_refund_amount =
      parseFloat(refund_count) * rates.refund_fee + parseFloat(refund_amount);

    const total_chargeback_amount =
      parseFloat(chargeback_count) * rates.chargeback_fee +
      parseFloat(chargeback_amount);

    const settlement_vol = parseFloat(
      (
        settlement_amount -
        total_refund_amount -
        total_chargeback_amount
      ).toFixed(3)
    );

    const report_id = await calculateReportID(client_data.client_id);
    
    const settlementmanual_record = new Settlementtable({
      client_id: client_data["client_id"],
      report_id,
      company_name,
      fromDate,
      toDate,
      total_vol: app_vol,
      eur_app_count,
      eur_dec_count,
      usd_app_count,
      usd_dec_count,
      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      settlement_fee_amount,
      eur_no_of_refund,
      usd_no_of_refund,
      eur_refund_amount,
      usd_refund_amount,
      eur_no_of_chargeback,
      usd_no_of_chargeback,
      eur_chargeback_amount,
      usd_chargeback_amount,
      total_refund_amount,
      total_chargeback_amount,
      date_settled: settlementDate,
      settlement_vol,
      conversion_in_usdt,
      total_amount_in_usdt,
      note,
    });

    await settlementmanual_record.save()
    res.status(201).json({
      message: "Settlement created successully",
      settlementmanual_record: settlementmanual_record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createDailySettlementExcel(req, res) {
  try {
    const { fromDate, toDate, company_name } = req.body;

//     const startDate = new Date(fromDate);
//     const endDate = new Date(toDate);
console.table({fromDate, toDate})
// console.table({startDate, endDate})
    let settlement_records = [];

    for (let date = new Date(fromDate); date <= new Date(toDate); date.setDate(date.getDate() + 1)) {
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);

      const newfromDate = `${year}-${month}-${day} 00:00:00`;
      const newtoDate = `${year}-${month}-${day} 23:59:59`;

      const rates = await Ratetable.findOne({ company_name });

      const all_txn_of_company = await LiveTransactionTable.aggregate([
        {
          $match: {
            merchant: company_name,
            transactiondate: {
              $gte: newfromDate,
              $lte: newtoDate,
            },
          },
        },
        {
          $group: {
            _id: { currency: "$currency", status: "$Status" },
            totalTransactions: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $group: {
            _id: "$_id.currency",
            statuses: {
              $push: {
                status: "$_id.status",
                totalTransactions: "$totalTransactions",
                totalAmount: "$totalAmount",
              }
            }
          }
        }
      ]);

      let app_count = 0;
      let app_vol = 0;
      let dec_count = 0;
      let dec_vol = 0;
      let usd_app_count = 0;
      let usd_dec_count = 0;
      let eur_app_count = 0;
      let eur_dec_count = 0;

      all_txn_of_company.forEach((currencyGroup) => {
        const status = currencyGroup.statuses;
        const currency = currencyGroup._id;

        status.forEach((statusGroup) => {
          const { totalTransactions, totalAmount } = statusGroup;

          if (currency === "USD") {
            if (statusGroup.status === "Success") {
              usd_app_count += totalTransactions;
              app_vol += totalAmount;
            } else if (statusGroup.status === "Failed" || statusGroup.status === "Incompleted") {
              usd_dec_count += totalTransactions;
              dec_vol += totalAmount;
            }
          } else if (currency === "EUR") {
            if (statusGroup.status === "Success") {
              eur_app_count += totalTransactions;
              app_vol += totalAmount;
            } else if (statusGroup.status === "Failed" || statusGroup.status === "Incompleted") {
              eur_dec_count += totalTransactions;
              dec_vol += totalAmount;
            }
          }
        });
      });

      app_count = eur_app_count + usd_app_count;
      dec_count = eur_dec_count + usd_dec_count;

      const MDR_amount = parseFloat((app_vol * (rates.MDR / 100)).toFixed(3));
      const app_amount = parseFloat((app_count * rates.txn_app).toFixed(3));
      const dec_amount = parseFloat((dec_count * rates.txn_dec).toFixed(3));
      const RR_amount = parseFloat((app_vol * (rates.RR / 100)).toFixed(3));

      const settlement_amount = parseFloat(
        (app_vol - MDR_amount - app_amount - dec_amount - RR_amount).toFixed(3)
      );

      const settlement_fee_amount = parseFloat(
        (settlement_amount * (rates.settlement_fee / 100)).toFixed(3)
      );

      const final_settlement_amount = parseFloat(
        (settlement_amount - settlement_fee_amount).toFixed(3)
      );

      const settlementDate = `${year}-${month}-${day}`;

      const settlement_record = {
        "Date": newfromDate.split(" ")[0],
        "Volumes": app_vol,
        "MDR":MDR_amount,
        "Approve Txn":app_amount,
        "Decline Txn":dec_amount,
        "Rolling Reserve":RR_amount,
        "Settlement Amount":settlement_amount,
        "Settlement Fee":settlement_fee_amount,
        "Total Settlement Amount":final_settlement_amount
      };

      settlement_records.push(settlement_record);
    }

    res.status(201).json(
      settlement_records,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createSettlement,
  previewSettlement,
  getSettlement,
  updateSettlement,
  getSettlementRecordforPDF,
  sendEmail,
  getCounts,
  deleteSettlement,
  semimanualSettlements,
  manualSettlements,
  createDailySettlementExcel
};
