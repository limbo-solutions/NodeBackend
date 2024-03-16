const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    category_name: { type: String },
    short_name: { type: String },
    Status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
      },
  });
  
  const Category = mongoose.model("Category", categorySchema);
  
  module.exports = Category;
  