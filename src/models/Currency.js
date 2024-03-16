const mongoose = require("mongoose");

const createcurrencySchema = new mongoose.Schema({
    currency_name: { type: String },
    currency_code: { type: String },
    Status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
      },
  });
  
  const Createcurrency = mongoose.model("Createcurrency", createcurrencySchema);
  
  module.exports = Createcurrency;
  