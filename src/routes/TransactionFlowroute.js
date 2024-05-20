const express = require("express");

const {initiateTransaction, getInfoOfTxn, getTransaction} = require("../controllers/transactionflowcontroller");

const router = express.Router();

router.post("/transactionflow/initiate", initiateTransaction);
router.get("/transactionflow/info_transaction", getInfoOfTxn);
router.post("/transactionflow/get_transaction", getTransaction);

module.exports = router;