require("../config/database");
const Category = require("../models/Category");

async function createCategory(req, res) {
  try {
    const { category_name, short_name, Status } = req.body;

    const category = new Category({
      category_name,
      short_name,
      Status,
    });

    await category.save();

    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getCategory(req, res) {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function searchCategory(req, res) {
  try {
    const { category_name, short_name, Status } = req.body;

    const searchCriteria = {};

    if (category_name !== undefined) {
      searchCriteria.category_name = {
        $regex: new RegExp(`^${category_name}$`, "i"),
      };
    }
    if (short_name !== undefined) {
      searchCriteria.short_name = {
        $regex: new RegExp(`^${short_name}$`, "i"),
      };
    }

    if (Status !== undefined) {
      searchCriteria.Status = { $regex: new RegExp(`^${Status}$`, "i") };
    }

    const foundCategories = await Category.find(searchCriteria);

    if (foundCategories.length > 0) {
      return res.status(200).json({
        message: "Categories found",
        categories: foundCategories,
      });
    } else {
      return res.status(404).json({ message: "Categories not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteCategory(req, res) {
  try {
    const { category_name } = req.body;

    const existingCategory = await Category.findOne({ category_name });
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    await Category.findOneAndDelete({ category_name });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateCategory(req, res) {
  try {
    const { id, category_name, short_name, Status } = req.body;

    const existingCategory = await Category.findById(id);
    
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (category_name) {
      existingCategory.category_name = category_name;
    }
    if (short_name) {
      existingCategory.short_name = short_name;
    }
    if (Status) {
      existingCategory.Status = Status;
    }
    const updatedCategory = await existingCategory.save();

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createCategory,
  getCategory,
  searchCategory,
  deleteCategory,
  updateCategory,
};


