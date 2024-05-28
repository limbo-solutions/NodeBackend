require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");

const ApprovalRatioChart = async (req, res) => {
    let { startDate, endDate, interval } = req.query;

  if (!startDate || !endDate || !interval) {
    return res.status(400).send({ error: 'startDate, endDate, and interval query parameters are required' });
  }

console.log(startDate);
console.log(endDate);

startDate = startDate.split("T")[0]+ " 00:00:00"
endDate = endDate.split("T")[0]+ " 23:59:59"

  console.table({startDate, endDate, interval});

  try{

    if(interval )
    res.json({message: "Running"})
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  };

module.exports = {ApprovalRatioChart}