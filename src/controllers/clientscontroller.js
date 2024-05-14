require("../config/database");
const Client = require("../models/Client");

async function createClient(req, res) {
  try {
    const {
      company_name,
      username,
      email,
      phone_number,
      postal_code,
      country,
      state,
      city,
      street_address,
      street_address2,
      industries_id,
      director_first_name,
      director_last_name,
      skype_id,
      business_type,
      business_category,
      business_subcategory,
      buiness_registered_on,
      merchant_pay_in,
      merchant_pay_out,
      settlement_charge,
      turnover,
      expected_chargeback_percentage,
      website_url,
      merchant_id,
      status,
      currency,
    } = req.body;

    const client = new Client({
      company_name,
      username,
      email,
      phone_number,
      postal_code,
      country,
      state,
      city,
      street_address,
      street_address2,
      industries_id,
      director_first_name,
      director_last_name,
      skype_id,
      business_type,
      business_category,
      business_subcategory,
      buiness_registered_on,
      merchant_pay_in,
      merchant_pay_out,
      settlement_charge,
      turnover,
      expected_chargeback_percentage,
      website_url,
      merchant_id,
      status,
      currency,
    });

    await client.save();

    res
      .status(201)
      .json({ message: "Client created successfully", client: client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getClient(req, res) {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createClient, getClient };
