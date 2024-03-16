require("../config/database");
const Businesstype = require("../models/Businesstype");

async function createBusinesstype(req, res) {
  try {
    const { businesstype_name, Status } = req.body;
    const businessType = new Businesstype({
      businesstype_name,
      Status,
    });

    await businessType.save();

    res
      .status(201)
      .json({ message: "Business type created successfully", businessType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getBusinesstype(req, res) {
  try {
    const businessTypes = await Businesstype.find();

    res.status(200).json(businessTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function searchBusinesstype(req, res) {
  try {
      const { businesstype_name, Status } = req.body;

      const searchCriteria = {};

      if (businesstype_name !== undefined) {
          searchCriteria.businesstype_name = { $regex: new RegExp(`^${businesstype_name}$`, "i"), };
      }

      if (Status !== undefined) {
          searchCriteria.Status = { $regex: new RegExp(`^${Status}$`, "i"), };
      }

      const foundBusinessTypes = await Businesstype.find(searchCriteria);

      if (foundBusinessTypes.length > 0) {
          return res.status(200).json({
              message: "Business types found",
              businessTypes: foundBusinessTypes
          });
      } else {
          return res.status(404).json({ message: "Business type not found" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteBusinesstype(req, res) {
  try {
    const { businesstype_name } = req.body;

    const existingBusinessType = await Businesstype.findOne({ businesstype_name, });

    if (!existingBusinessType) {
      return res.status(404).json({ error: "Business type not found" });
    }

    await Businesstype.findOneAndDelete({ businesstype_name });

    res.status(200).json({ message: "Business type deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateBusinesstype(req, res) {
  try {
    const { id, businesstype_name, Status } = req.body;

    const existingBusinessType = await Businesstype.findById(id)
;
    if (!existingBusinessType) {
      return res.status(404).json({ error: "Business type not found" });
    }

    if (businesstype_name) {
      existingBusinessType.businesstype_name = businesstype_name;
    }
    if (Status) {
      existingBusinessType.Status = Status;
    }
    const updatedBusinessType = await existingBusinessType.save();

    res.status(200).json({
      message: "Business type updated successfully",
      businessType: updatedBusinessType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createBusinesstype,
  getBusinesstype,
  searchBusinesstype,
  deleteBusinesstype,
  updateBusinesstype,
};