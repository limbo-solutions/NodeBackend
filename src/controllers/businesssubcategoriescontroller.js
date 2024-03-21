const Businessubcategory = require("../models/Businesssubcategory");
const mongoose = require("mongoose");
require("../config/database");

async function createBusinesssubcategory(req, res) {
  try {
    const { subcategory_name, category_name, Status } = req.body;

    const businessubcategory = new Businessubcategory({
      subcategory_name,
      category_name,
      Status: Status || "Active",
    });

    await businessubcategory.save();

    res.status(201).json({
      message: "Business subcategory created successfully",
      businessubcategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getBusinesssubcategory(req, res) {
  try {
    const businessubcategories = await Businessubcategory.find();

    res.status(200).json(businessubcategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function searchBusinesssubcategory(req, res) {
  try {
    const { subcategory_name, category_name, Status } = req.body;

    const searchCriteria = {};

    if (subcategory_name !== undefined) {
      searchCriteria.subcategory_name = {
        $regex: new RegExp(`^${subcategory_name}$`, "i"),
      };
    }
    if (category_name !== undefined) {
      searchCriteria.category_name = {
        $regex: new RegExp(`^${category_name}$`, "i"),
      };
    }
    if (Status !== undefined) {
      searchCriteria.Status = { $regex: new RegExp(`^${Status}$`, "i") };
    }

    const foundBusinessubcategories = await Businessubcategory.find(
      searchCriteria
    );

    if (foundBusinessubcategories.length > 0) {
      return res.status(200).json({
        message: "Business subcategories found",
        businessubcategories: foundBusinessubcategories,
      });
    } else {
      return res
        .status(404)
        .json({ message: "Business subcategories not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteBusinesssubcategory(req, res) {
  try {
    const { subcategory_name } = req.body;

    const existingSubcategory = await Businessubcategory.findOne({
      subcategory_name,
    });
    if (!existingSubcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    await Businessubcategory.findOneAndDelete({ subcategory_name });

    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateBusinesssubcategory(req, res) {
  try {
    const { id, subcategory_name, category_name, Status } = req.body;

    const existingBusinessubcategory = await Businessubcategory.findById(id);
    if (!existingBusinessubcategory) {
      return res.status(404).json({ error: "Business subcategory not found" });
    }

    if (subcategory_name) {
      existingBusinessubcategory.subcategory_name = subcategory_name;
    }
    if (category_name) {
      existingBusinessubcategory.category_name = category_name;
    }

    if (Status) {
      existingBusinessubcategory.status = Status;
    }
    const updatedBusinessubcategory = await existingBusinessubcategory.save();

    res.status(200).json({
      message: "Business subcategory updated successfully",
      businessubcategory: updatedBusinessubcategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createBusinesssubcategory,
  getBusinesssubcategory,
  searchBusinesssubcategory,
  deleteBusinesssubcategory,
  updateBusinesssubcategory,
};
