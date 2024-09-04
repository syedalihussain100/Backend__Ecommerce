const asyncHandler = require("express-async-handler");
const { productCategoryModel } = require("../models/Category");


// create category

const createCategory = asyncHandler(async (req, res) => {
    try {
        // Extract the title from the request body
        const { title } = req.body;

        // Check if the title is provided
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Check if a category with the same title already exists
        const existingCategory = await productCategoryModel.findOne({ title });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category with this title already exists' });
        }

        // Create the new category
        const newCategory = await productCategoryModel.create(req.body);
        res.status(201).json(newCategory); // Status 201 for resource creation
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// update category

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCategory = await productCategoryModel.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// delete category

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCategory = await productCategoryModel.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// get category id

const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const getaCategory = await productCategoryModel.findById(id);
        res.json(getaCategory);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});



// get all category

const getallCategory = asyncHandler(async (req, res) => {
    try {
        const getallCategory = await productCategoryModel.find();
        res.json(getallCategory);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});
module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getallCategory,
};