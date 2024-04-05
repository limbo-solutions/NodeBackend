const Createbank = require("../models/Createbank");
const mongoose = require("mongoose");
require("../config/database");

async function createBank(req, res) {
  try {
    const { bank_name, div_id, bank_url, Status } = req.body;

    const bank = new Createbank({
      bank_name,
      div_id,
      bank_url,
      Status: Status || "Active",
    });

    await bank.save();

    res.status(201).json({ message: "Bank created successfully", bank });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getBank(req, res) {
  try {
    const banks = await Createbank.find();

    res.status(200).json(banks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function searchBank(req, res) {
  try {
    const { bank_name, div_id, bank_url, Status } = req.body;

    const searchCriteria = {};

    if (bank_name !== undefined) {
      searchCriteria.bank_name = { $regex: new RegExp(`^${bank_name}$`, "i") };
    }
    if (div_id !== undefined) {
      searchCriteria.div_id = { $regex: new RegExp(`^${div_id}$`, "i") };
    }
    if (bank_url !== undefined) {
      searchCriteria.bank_url = { $regex: new RegExp(`^${bank_url}$`, "i") };
    }
    if (Status !== undefined) {
      searchCriteria.Status = { $regex: new RegExp(`^${Status}$`, "i") };
    }

    const foundBanks = await Createbank.find(searchCriteria);

    if (foundBanks.length > 0) {
      return res.status(200).json({
        message: "Bank found",
        banks: foundBanks,
      });
    } else {
      return res.status(404).json({ message: "Bank not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteBank(req, res) {
  try {
    const { bank_name } = req.body;

    const existingBank = await Createbank.findOne({ bank_name });
    if (!existingBank) {
      return res.status(404).json({ error: "Bank not found" });
    }

    await Createbank.findOneAndDelete(bank_name);

    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateBank(req, res) {
  try {
    const { id, bank_name, div_id, bank_url, Status } = req.body;

    const existingBank = await Createbank.findById(id);
    if (!existingBank) {
      return res.status(404).json({ error: "Bank not found" });
    }

    if (bank_name) {
      existingBank.bank_name = bank_name;
    }
    if (div_id) {
      existingBank.div_id = div_id;
    }
    if (bank_url) {
      existingBank.bank_url = bank_url;
    }
    if (Status) {
      existingBank.Status = Status;
    }
    const updatedBank = await existingBank.save();

    res.status(200).json({
      message: "Bank updated successfully",
      bank: updatedBank,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createBank,
  getBank,
  searchBank,
  deleteBank,
  updateBank,
};
