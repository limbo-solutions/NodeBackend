const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const clientSchema = new mongoose.Schema({
  company_name: { type: String, },
  username: { type: String },
  email: { type: String },
  phone_number: { type: Number},
  postal_code: { type: Number },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  street_address: { type: String },
  street_address2: { type: String },
  industries_id: { type: String },
  director_first_name: { type: String },
  director_last_name: { type: String },
  skype_id: { type: String },
  business_type: { type: String, ref: "Businesstype" },
  business_category: { type: String, ref: "Category" },
  business_subcategory: { type: String, ref: "Businesssubcategory" },
  buiness_registered_on: { type: String},
  merchant_pay_in: { type: String },
  merchant_pay_out: { type: String },
  settlement_charge: { type: Number },
  turnover: { type: String },
  expected_chargeback_percentage: { type: Number },
  website_url: { type: String },
  merchant_id: { type: String },
  status: { type: String, enum: ["Active", "Inactive", "Pending"], default: "Active" },
  last_settled_date: {type: String},
  type: { type: String },
  industry: { type: String },
  currency: {
    default: ["USD", "EUR"],
    type: [String],
    validate: {
      validator: function (v) {
        return Array.isArray(v); 
      },
    },
  },
});

clientSchema.plugin(AutoIncrement, { inc_field: "client_id", start_seq: 24 });

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
