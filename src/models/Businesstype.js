const mongoose = require("mongoose");

const businesstypeSchema = new mongoose.Schema({
    businesstype_name: { type: String },
    Status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
      },
  });
  
  const Businesstype = mongoose.model("Businesstype", businesstypeSchema);
  
  module.exports = Businesstype;
  