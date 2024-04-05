const Currency = require("../models/Currency");
const mongoose = require("mongoose");
require("../config/database");

async function createCurrency(req, res) {
  try {
    const { currency_name, currency_code, Status } = req.body;

    const currency = new Currency({
      currency_name,
      currency_code,
      Status: Status || "Active",
    });

    await currency.save();

    res
      .status(201)
      .json({ message: "Currency created successfully", currency });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getCurrency(req, res) {
  try {
    const currencies = await Currency.find();

    res.status(200).json(currencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function searchCurrency(req, res) {
  try {
    const { currency_name, currency_code, Status } = req.body;

    const searchCriteria = {};

    if (currency_name !== undefined) {
      searchCriteria.currency_name = {
        $regex: new RegExp(`^${currency_name}$`, "i"),
      };
    }
    if (currency_code !== undefined) {
      searchCriteria.currency_code = {
        $regex: new RegExp(`^${currency_code}$`, "i"),
      };
    }

    if (Status !== undefined) {
      searchCriteria.Status = { $regex: new RegExp(`^${Status}$`, "i") };
    }

    const foundCurrencies = await Currency.find(searchCriteria);

    if (foundCurrencies.length > 0) {
      return res.status(200).json({
        message: "Currencies found",
        currencies: foundCurrencies,
      });
    } else {
      return res.status(404).json({ message: "Currencies not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteCurrency(req, res) {
  try {
    const { currency_name } = req.body;

    const existingCurrency = await Currency.findOne({ currency_name });
    if (!existingCurrency) {
      return res.status(404).json({ error: "Currency not found" });
    }

    await Currency.findOneAndDelete({ currency_name });

    res.status(200).json({ message: "Currency deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateCurrency(req, res) {
  try {
    const { id, currency_name, currency_code, Status } = req.body;

    const existingCurrency = await Currency.findById(id);
    if (!existingCurrency) {
      return res.status(404).json({ error: "Currency not found" });
    }

    if (currency_name) {
      existingCurrency.currency_name = currency_name;
    }
    if (currency_code) {
      existingCurrency.currency_code = currency_code;
    }
    if (Status) {
      existingCurrency.Status = Status;
    }
    const updatedCurrency = await existingCurrency.save();

    res.status(200).json({
      message: "Currency updated successfully",
      currency: updatedCurrency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createCurrency,
  getCurrency,
  searchCurrency,
  deleteCurrency,
  updateCurrency,
};
