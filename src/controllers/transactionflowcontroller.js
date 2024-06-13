const TransactionFlow = require("../models/TransactionFlow");
const TempTransactionTable = require("../models/TempTransactionTable");
const OrderTransactionTable = require("../models/OrderTransactionTable");

const blackListed = [
  "Afghanistan",
  "Albania",
  "American Samoa",
  "Angola",
  "Bahamas",
  "Barbados",
  "Belarus",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Burkina Faso",
  "Cambodia",
  "Columbia",
  "Cayman Islands",
  "Central African Republic",
  "Democratic Republic of the Congo",
  "Croatia",
  "Cuba",
  "Eritrea",
  "Ethiopia",
  "El Salvador",
  "Fiji",
  "Ghana",
  "Guam",
  "Guinea-Bissau",
  "Guatemala",
  "Haiti",
  "Hong Kong",
  "Iceland",
  "India",
  "Iraq",
  "Iran",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "South Korea",
  "Kosovo",
  "Lebanon",
  "Libya",
  "Mali",
  "Malta",
  "Mauritius",
  "Mongolia",
  "Montenegro",
  "Myanmar",
  "Nicaragua",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Oman",
  "Pakistan",
  "Palau",
  "Peru",
  "Panama",
  "Papua New Guinea",
  "Philippines",
  "Romania",
  "Russia",
  "Rwanda",
  "Samoa",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Slovenia",
  "Somalia",
  "South Sudan",
  "Sri Lanka",
  "Sudan",
  "Syria",
  "Turkey",
  "Uganda",
  "United States",
  "Venezuela",
  "Zimbabwe",
];

async function initiateTransaction(req, res) {
  try {
    const {
      merchantID,
      transactionID,
      orderNo,
      name,
      email,
      phone,
      amount,
      currency,
      cardnumber,
      cardExpire,
      cardCVV,
      backURL,
      requestMode,
    } = req.body;
    console.log("Request received");

    const maskedcardno = mask(cardnumber);
    console.log("Card masked");

    const token = generateToken();
    console.log("Token", token);

    const txnId = generateUniqueTransactionId();
    const [cardtype, country] = await binAPI(maskedcardno.slice(0, 6));

    const newTransaction = new TempTransactionTable({
      merchantID,
      merchantTxnID: transactionID,
      orderNo,
      name,
      email,
      phone,
      amount,
      currency,
      cardnumber: maskedcardno,
      cardExpire,
      cardCVV: "*".repeat(cardCVV.length),
      backURL,
      requestMode,
      transactiondate: new Date(),
      country,
      cardtype,
      txnId,
      token,
    });

    await newTransaction.save();

    console.log("Record saved");

    console.log("Response sent");

    // Perform the remaining operations asynchronously
    const response = await processTransaction(
      txnId,
      orderNo,
      name,
      email,
      phone,
      amount,
      currency,
      cardnumber,
      cardExpire,
      cardCVV,
      backURL,
      requestMode
    );

    //Redirect to callback url
    const redirectUrl = `https://centpays.com/v2/ini_payment/${response.token}`;
    res.status(200).json( {redirectUrl });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Something wrong happened" });
    }
  }
}

async function processTransaction(
  txnId,
  orderNo,
  name,
  email,
  phone,
  amount,
  currency,
  cardnumber,
  cardExpire,
  cardCVV,
  backURL,
  requestMode
) {
  try {
    // const iscountryBlacklisted = blackListed.some(
    //   (c) => c.toLowerCase() === country.toLowerCase()
    // );
    // let update = {};
    // if (iscountryBlacklisted) {
    //   update = {
    //     status: "Failed",
    //     message: "Geolocation Blacklisted",
    //     txnId: txnId
    //   };
    // } else {
    const dataforBank = {
      name,
      email,
      phone,
      amount,
      currency,
      transaction_id: txnId,
      order_number: orderNo,
      back_url: backURL,
      requestMode,
      cardNo: cardnumber,
      cardExpire,
      cardCVC: cardCVV,
    };

    console.log("data", dataforBank);
    const responsefromBank = await Bank(dataforBank);
    console.log("response", responsefromBank);
    update = {
      status: responsefromBank.status,
      message: responsefromBank.message,
      token: responsefromBank.token,
    };
    // }

    await TempTransactionTable.updateOne({ txnId }, { $set: update });
    console.log("Temp Record updated");

    // getCallbackfromCentpays(update.token)
    
    // const updatedTxnId = update.txnId;
    // console.log("Txnid", updatedTxnId);

    // const temp_transaction = await TempTransactionTable.findOne({
    //   txnId
    // });

    // console.log("temp_transaction", temp_transaction);

    // const order_transaction = new OrderTransactionTable({
    //   merchantID: temp_transaction.merchantID,
    //   merchantTxnID: temp_transaction.merchantTxnID,
    //   name: temp_transaction.name,
    //   email: temp_transaction.email,
    //   amount: temp_transaction.amount,
    //   currency: temp_transaction.currency,
    //   cardnumber: temp_transaction.cardnumber,
    //   cardExpire: temp_transaction.cardExpire,
    //   cardCVV: temp_transaction.cardCVV,
    //   transactiondate: temp_transaction.transactiondate,
    //   country: temp_transaction.country,
    //   cardtype: temp_transaction.cardtype,
    //   txnId: temp_transaction.txnId,
    //   token: temp_transaction.token,
    //   status: temp_transaction.status,
    //   message: temp_transaction.message,
    // });

    // await order_transaction.save();

    // console.log("Order Record saved");

    // await TempTransactionTable.deleteOne({ txnId });
    return responsefromBank;
  } catch (error) {
    console.error("Error processing transaction:", error);
  }
}

async function getCallbackfromCentpays(token, retries = 3, timeout = 5000) {
  const controller = new AbortController();
  const signal = controller.signal;

  const fetchWithTimeout = (url, options, timeout) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        controller.abort();
        reject(new Error("Request Timeout"));
      }, timeout);

      fetch(url, { ...options, signal })
        .then(response => {
          clearTimeout(timer);
          if (!response.ok) {
            reject(new Error(`Network response was not ok: ${response.statusText}`));
          } else {
            resolve(response.json());
          }
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const data = await fetchWithTimeout(`https://centpays.com/v2/ini_payment/${token}`, {}, timeout);
      return data;
    } catch (error) {
      if (attempt < retries) {
        console.log(`Attempt ${attempt} failed, retrying...`);
      } else {
        console.error("There was a problem with the fetch operation from ini_payment:", error);
        throw error;
      }
    }
  }
}


async function Bank(dataforBank) {
  console.log("In bank");
  try {
    // const response = await fetch("http://54.159.39.148/", {

    const response = await fetch("https://centpays.com/v2/process_payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key":
          "live_$2y$10$MO5xnO7AVcwTKmovvi6fEuTDdlaT/CRpCgdK0nTjuNqZ1xWiZrmL6",
        "api-secret":
          "live_$2y$10$fNghQ0yJycZCeDinrWRG/.1rHN74XCM3lLpd2fWfrCFkwG.cEz.3W",
      },
      body: JSON.stringify(dataforBank),
    });
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      "There was a problem with the fetch operation of Bank:",
      error
    );
    throw error;
  }
}

function mask(cardno) {
  let firstSix = cardno.slice(0, 6);
  let lastFour = cardno.slice(-4);

  let maskedNumber = firstSix + "******" + lastFour;
  return maskedNumber;
}

function generateToken() {
  console.log("entered");
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
  let token = "";
  console.log(token);
  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }
  console.log(token);
  return token;
}

function generateUniqueTransactionId() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 8);
  const transactionId = `temp_${timestamp}-${randomString}`;

  return transactionId;
}

async function binAPI(bin) {
  console.log("bin", bin);
  try {
    const response = await fetch(`https://data.handyapi.com/bin/${bin}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    return [data.Scheme, data.Country.Name];
  } catch (error) {
    console.error(
      "There was a problem with the fetch operation from bin:",
      error
    );
    throw error;
  }
}

async function getInfoOfTxn(req, res) {
  try {
    const { token } = req.query;
    const transaction = await TransactionFlow.findOne({ token: token });
    res.status(200).json({
      code: "200",
      status: transaction.status,
      message: transaction.message,
      transactionID: transaction.merchantTxnID,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function getTransaction(req, res) {
  try {
    const { transactionID } = req.body;
    const transaction = await TransactionFlow.findOne({
      merchantTxnID: transactionID,
    });

    res.status(200).json({
      code: "200",
      status: "OK",
      message: "Transaction Processed Successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function getCallback(req, res){
  try {
    const {code, status, message, Transaction_id}
     = req.body;
    console.table({code, status, message, Transaction_id})
    res.status(201).send("Callback received")
  }catch(error){
   console.log(error)
  }
}

module.exports = { initiateTransaction, getInfoOfTxn, getTransaction, getCallback };