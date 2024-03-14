require("../config/database");
const Client = require("../models/Client");

async function createClient(req, res) {
  try {
    const {
      company_name,
      company_type,
      website_url,
      company_email,
      city,
      status,
      acquirer_name,
      last_settled_date,
    } = req.body;

    // Create a new client
    const client = new Client({
      company_name,
      company_type,
      website_url,
      company_email,
      city,
      status,
      acquirer_name,
      last_settled_date,
    });

    // Save the client to the database
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
