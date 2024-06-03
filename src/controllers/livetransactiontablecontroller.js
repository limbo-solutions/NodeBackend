require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");

async function getLivedata(req, res) {
  try {
    const apiUrl = "https://centpays.com/apidoc/get_all_transaction";
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Expected JSON response");
    }

    const apiData = await response.json();
    const data = apiData.data;

    const lastProcessedRecord = await LiveTransactionTable.findOne().sort({
      livedata_id: -1,
    });
    const maxId = lastProcessedRecord ? lastProcessedRecord.livedata_id : 1;

    const newRecords = [];
    const updatedRecords = [];

    for (const item of data) {
      if (item.id > maxId) {
        newRecords.push({
          livedata_id: item.id,
            txnid: item.transactionId,
            merchantTxnId: item.mtxnID,
            merchant: item["merchant_name"].trim().charAt(0).toUpperCase() + item["merchant_name"].slice(1).toLowerCase(),
            amount: item.amount,
            fee: item.fee,
            merchant_fee: item.merchant_fee,
            backUrl: item.backUrl,
            merchant_id: item.merchant_id,
            transactiondate: item.transaction_date,
            statusBKP: item.statusBKP,
            Status: item.status,
            isSettled: item.isSettled,
            settledDate: item.settledDate,
            settledTxnId: item.settledTxnId,
            settledAmount: item.settledAmount,
            router: item.router,
            description: item.description,
            email: item.email,
            currency: item.currency,
            env: item.env,
            mode: item.mode,
            paymentgateway: item.payment_mode,
            payment_id: item.payment_id,
            pg_order_key: item.order_key,
            message: item.message,
            webhook_id: item.webhook_id,
            requested_phone: item.requested_phone,
            orderNo: item.requested_orderNumber,
            cname: item.requested_name,
            tempUpdated: item.tempUpdated,
            is_admin_settled: item.is_admin_settled,
            admin_settled_date: item.admin_settled_date,
            admin_settled_amount: item.admin_settled_amount,
            cardtype: item.cardType,
            requestMode: item.requestMode,
            cardnumber: item.cardNo,
            cardExpire: item.cardExpire,
            cardCVC: item.cardCVC,
            pdate: item.pdate,
            country: item.country,
            dels: item.dels,
            web_url: item.web_url,
            mid: item.mid,
            from_temp: item.from_temp,
            accountHolder: item.accountHolder,
            accountBankCode: item.accountBankCode,
            accountNumber: item.accountNumber,
            birthDate: item.birthDate,
            internal_callback: item.internal_callback,
            internal_callback_time: item.internal_callback_time,
        });
      } else {
        const existingRecord = await LiveTransactionTable.findOne({ livedata_id: item.id });
        if (existingRecord && existingRecord.Status !== item.status) {
          updatedRecords.push({
            updateOne: {
              filter: { livedata_id: item.id },
              update: { Status: item.status },
            },
          });
        }
      }
    }

    if (newRecords.length > 0) {
      await LiveTransactionTable.insertMany(newRecords);
    }

    if (updatedRecords.length > 0) {
      await LiveTransactionTable.bulkWrite(updatedRecords);
    }

    if (req && res) {
      res.json({ newRecords, updatedRecords });
    }
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    if (req && res) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

const interval = 60000; 
setInterval(getLivedata, interval);

async function searchTransactions(req, res) {
  try {
    const { fromDate, toDate, status } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "Both fromDate and toDate are required" });
    }

    const query = {
      transactiondate: {
        $gte: fromDate,
        $lte: toDate,
      }
    };

    if (status) {
      query.Status = status;
    }

    const transactions = await LiveTransactionTable.find(query);

    res.json(transactions);
  } catch (error) {
    console.error("Error searching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getLatestTransactions(req, res) {
  try {
    const transactions = await LiveTransactionTable.find().sort({ transactiondate: -1 }).limit(100); 

    if (req && res) {
      res.json(transactions);
    }
  } catch (error) {
    console.error("Error fetching latest transactions:", error);
    if (req && res) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = { getLivedata, searchTransactions, getLatestTransactions };