const Documenttype = require("../models/Documenttype");
const mongoose = require("mongoose");
require("../config/database");

async function createDocumenttype(req, res) {
  try {
    const { document_type, Status } = req.body;

    const documentType = new DocumentType({
      document_type,
      Status: Status || "Active",
    });

    await documentType.save();

    res
      .status(201)
      .json({ message: "Document type created successfully", documentType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getDocumenttype(req, res) {
  try {
    const documentTypes = await Documenttype.find();

    res.status(200).json(documentTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function searchDocumenttype(req, res) {
  try {
    const { document_type, Status } = req.body;

    const searchCriteria = {};

    if (document_type !== undefined) {
      searchCriteria.document_type = {
        $regex: new RegExp(`^${document_type}$`, "i"),
      };
    }

    if (Status !== undefined) {
      searchCriteria.Status = {
        $regex: new RegExp(`^${Status}$`, "i"),
      };
    }

    const foundDocumentTypes = await Documenttype.find(searchCriteria);

    if (foundDocumentTypes.length > 0) {
      return res.status(200).json({
        message: "Document types found",
        documentTypes: foundDocumentTypes,
      });
    } else {
      return res.status(404).json({ message: "Document types not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteDocumenttype(req, res) {
  try {
    const { document_type } = req.body;

    const existingDocumentType = await DocumentType.findOne({ document_type });
    if (!existingDocumentType) {
      return res.status(404).json({ error: "Document type not found" });
    }
    await DocumentType.findOneAndDelete({ document_type });

    res.status(200).json({ message: "Document type deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateDocumenttype(req, res) {
  try {
    const { id, document_type, Status } = req.body;

    const existingDocumentType = await Documenttype.findById(id);
    if (!existingDocumentType) {
      return res.status(404).json({ error: "Document type not found" });
    }

    if (document_type) {
      existingDocumentType.document_type = document_type;
    }
    if (Status) {
      existingDocumentType.Status = Status;
    }
    const updatedDocumentType = await existingDocumentType.save();

    res.status(200).json({
      message: "Document type updated successfully",
      documentType: updatedDocumentType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createDocumenttype,
  getDocumenttype,
  searchDocumenttype,
  deleteDocumenttype,
  updateDocumenttype,
};
