const mongoose = require("mongoose");

const businesssubcategorySchema = new mongoose.Schema({
<<<<<<< HEAD
    subcategory_name: { type: String },
    category_name:  { type: String, ref: "Category", },
    Status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
    }
      });
  
  const Businesssubcategory = mongoose.model("Businesssubcategory", businesssubcategorySchema);
  
  module.exports = Businesssubcategory;
  
=======
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
>>>>>>> 51caf5f8106a5a1a6fd2e3672efd73eb2ff93cb6
