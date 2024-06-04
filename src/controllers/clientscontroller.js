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
      type,
      industry,
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
      type,
      industry,
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

async function viewClient(req, res) {
  try {
    const company_name = req.query.company_name;
    console.log(company_name)
    const client = await Client.findOne({company_name: company_name});
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateClient(req, res) {
  try {
    const { id, ...updateFields } = req.body;

    const clients = await Client.findById( id );

    if (!clients) {
      return res.status(404).json({ error: "Client not found" });
    }
    
    Object.keys(updateFields).forEach(field => {
      clients[field] = updateFields[field];
    });

    await clients.save();

    res.status(200).json({ message: "Client updated successfully", clients: clients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createClient, getClient, viewClient, updateClient }
