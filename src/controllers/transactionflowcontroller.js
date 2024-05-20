const TransactionFlow = require("../models/TransactionFlow");

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
      name,
      email,
      amount,
      currency,
      cardnumber,
      cardExpire,
      cardCVV,
    } = req.body;
    console.log("Request received");

    const maskedcardno = mask(cardnumber);
    console.log("Card masked");

    const token = generateToken();
    console.log("Token", token);

    const txnId = generateUniqueTransactionId();
    const transactiondate = new Date();
    const [cardtype, country] = await binAPI(maskedcardno.slice(0, 6));

    const newTransaction = new TransactionFlow({
      merchantID,
      merchantTxnID: transactionID,
      name,
      email,
      amount,
      currency,
      cardnumber: maskedcardno,
      cardExpire,
      cardCVV: "*".repeat(cardCVV.length),
      transactiondate,
      country,
      cardtype,
      txnId,
      token,
    });

    await newTransaction.save();

    console.log("Record saved");

    res.status(202).json({
      code: "202",
      status: "Accepted",
      message: "Token generated.",
      token,
    });

    console.log("Response sent");

    const iscountryBlacklisted = blackListed.some(
      (c) => c.toLowerCase() === country.toLowerCase()
    );
    let update = {};
    if (iscountryBlacklisted) {
      update = {
        status: "Failed",
        message: "Geolocation Blacklisted",
      };
    } else {
      const dataforBank = {
        name,
        email,
        amount,
        currency,
        cardnumber: maskedcardno,
        cardExpire,
        cardCVV,
        country,
        cardtype,
        txnId,
      };

      const responsefromBank = await Bank(dataforBank);
      console.log(responsefromBank);
      update = {
        status: responsefromBank.status,
        message: responsefromBank.message,
        txnId: responsefromBank.pgTransactionId,
      };
    }

    await TransactionFlow.updateOne(
      {txnId},
      { $set: update }
    );
    console.log("Record updated");
  } catch (error) {
    res.status(500).json({ error: "Something wrong happened" });
  }
}

async function Bank(dataforBank) {
  console.log("In bank");
  try {
    const response = await fetch("http://localhost:3001", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  const transactionId = `CP_${timestamp}-${randomString}`;

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

module.exports = { initiateTransaction, getInfoOfTxn, getTransaction };
