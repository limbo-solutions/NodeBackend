const mongoose = require("mongoose");

const createbankSchema = new mongoose.Schema({
    bank_name: { type: String },
    div_id: { type: String },
    bank_url: { type: String },
    Status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
      },
  });
  
  const Createbank = mongoose.model("Createbank", createbankSchema);
  
  module.exports = Createbank;
  