const mongoose = require("mongoose");

const documentcategorySchema = new mongoose.Schema({
    document_name: { type: String },
    document_type: { type: String, ref: "Documenttype", },
    side: { type: String },
    document_number: { type: Number },
    Status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
      },
  });
  
  const Documentcategory = mongoose.model("Documentcategory", documentcategorySchema);
  
  module.exports = Documentcategory;
  