const Documentcategory = require("../models/Documentcategory");
require("../config/database");

async function createDocumentcategory(req, res) {
  try {
    const { document_name, document_type, side, document_number, Status } =
      req.body;

    const documentCategory = new Documentcategory({
      document_name,
      document_type,
      side,
      document_number,
      Status: Status || "Active",
    });

    await documentCategory.save();

    res
      .status(201)
      .json({
        message: "Document category created successfully",
        documentCategory,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getDocumentcategory(req, res) {
  try {
    const documentCategories = await Documentcategory.find();

    res.status(200).json(documentCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function searchDocumentcategory(req, res) {
  try {
    const { document_name, document_type, side, document_number, Status } =
      req.body;

    const searchCriteria = {};

    if (document_name !== undefined) {
      searchCriteria.document_name = {
        $regex: new RegExp(`^${document_name}$`, "i"),
      };
    }
    if (document_type !== undefined) {
      searchCriteria.document_type = {
        $regex: new RegExp(`^${document_type}$`, "i"),
      };
    }
    if (side !== undefined) {
      searchCriteria.side = { $regex: new RegExp(`^${side}$`, "i") };
    }
    if (document_number !== undefined) {
      searchCriteria.document_number = document_number;
    }
    if (Status !== undefined) {
      searchCriteria.Status = { $regex: new RegExp(`^${Status}$`, "i") };
    }

    const foundDocumentCategories = await Documentcategory.find(searchCriteria);

    if (foundDocumentCategories.length > 0) {
      return res.status(200).json({
        message: "Document categories found",
        documentCategories: foundDocumentCategories,
      });
    } else {
      return res.status(404).json({ message: "Document categories not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteDocumentcategory(req, res) {
  try {
    const { document_name } = req.body;

    const existingDocumentCategory = await Documentcategory.findOne({
      document_name,
    });
    if (!existingDocumentCategory) {
      return res.status(404).json({ error: "Document category not found" });
    }

    await Documentcategory.findOneAndDelete({ document_name });

    res.status(200).json({ message: "Document category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateDocumentcategory(req, res) {
  try {
    const { id, document_name, document_type, side, document_number, Status } =
      req.body;

    const existingDocumentCategory = await Documentcategory.findById(id);
    if (!existingDocumentCategory) {
      return res.status(404).json({ error: "Document category not found" });
    }

    if (document_name) {
      existingDocumentCategory.document_name = document_name;
    }
    if (document_type) {
      existingDocumentCategory.document_type = document_type;
    }
    if (side) {
      existingDocumentCategory.side = side;
    }
    if (document_number) {
      existingDocumentCategory.document_number = document_number;
    }
    if (Status) {
      existingDocumentCategory.Status = Status;
    }
    const updatedDocumentCategory = await existingDocumentCategory.save();

    res.status(200).json({
      message: "Document category updated successfully",
      documentCategory: updatedDocumentCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createDocumentcategory,
  getDocumentcategory,
  searchDocumentcategory,
  deleteDocumentcategory,
  updateDocumentcategory,
};
