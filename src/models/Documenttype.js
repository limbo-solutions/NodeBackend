const mongoose = require("mongoose");

const documenttypeSchema = new mongoose.Schema({
    document_type: { type: String },
    Status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
      },
  });
  
  const Documenttype = mongoose.model("Documenttype", documenttypeSchema);
  
  module.exports = Documenttype;
  