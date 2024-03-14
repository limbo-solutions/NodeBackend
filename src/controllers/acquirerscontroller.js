require("../config/database");
const Acquirer = require("../models/Acquirer");

async function createAcquirer(req, res) {
  try {
    const { acquirer_name, acquirer_email, website_url, city, status } =
      req.body;

    // Create a new Acquirer
    const acquirer = new Acquirer({
      acquirer_name,
      acquirer_email,
      website_url,
      city,
      status,
    });

    // Save the client to the database
    await acquirer.save();

    res
      .status(201)
      .json({ message: "Acquirer created successfully", acquirer: acquirer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAcquirer(req, res) {
  try {
    const acquirers = await Acquirer.find();
    res.status(200).json(acquirers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createAcquirer, getAcquirer };
