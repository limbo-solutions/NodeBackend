const mongoose = require("mongoose");

const businesssubcategorySchema = new mongoose.Schema({
  subcategory_name: { type: String },
  category_name: { type: String, ref: "Category" },
  Status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
});

const Businesssubcategory = mongoose.model(
  "Businesssubcategory",
  businesssubcategorySchema
);

module.exports = Businesssubcategory;
