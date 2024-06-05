const express = require("express");

const {initiateTransaction, getInfoOfTxn, getTransaction, getCallback} = require("../controllers/transactionflowcontroller");

const router = express.Router();

router.post("/paymentlink", initiateTransaction);
router.get("/transactionflow/info_transaction", getInfoOfTxn);
router.post("/transactionflow/get_transaction", getTransaction);
router.post("/callbackurl", getCallback);

module.exports = router;