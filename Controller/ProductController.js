const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const {
    cloudinaryUploadImg,
    cloudinaryDeleteImg,
} = require("../utils/Cloudinary");
const fs = require("fs");
const { productModel } = require("../models/Product");


//create product
const createProduct = asyncHandler(async (req, res) => {
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'images');
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            console.log(newpath);
            urls.push(newpath);
            fs.unlinkSync(path);
        }

        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }

        const newProduct = await productModel({
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            quantity: req.body.quantity,
            images: urls,
            tags: req.body.tags
        })

        await newProduct.save();

        res.status(200).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// get alls products

const GetProduct = asyncHandler(async (req, res) => {
    try {
        // Filtering
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = productModel.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // Limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // Pagination
        const page = req.query.page * 1  
        const limit = req.query.limit * 1 ; 
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Handling out-of-bound pages
        const productCount = await productModel.countDocuments();
        if (skip >= productCount) throw new Error("This page does not exist");

        // Execute the query
        const products = await query;

        // Send response
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: products,
        });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});



// per id product here

const IdProducts = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const getIdProducts = await productModel.findById(id);
        if (!getIdProducts) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).send(getIdProducts);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
})

// update product here

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true, // This ensures that validation runs during the update
        });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});



const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleteProduct = await productModel.findOneAndDelete({ _id: id });
        if (!deleteProduct) {
            return res.status(400).send({ message: "Product Not Found" })
        }
        res.json(deleteProduct);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// create rating 

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = await productModel.findById(prodId);
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString()
        );
        if (alreadyRated) {
            const updateRating = await productModel.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated },
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": comment },
                },
                {
                    new: true,
                }
            );
        } else {
            const rateProduct = await productModel.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: {
                            star: star,
                            comment: comment,
                            postedby: _id,
                        },
                    },
                },
                {
                    new: true,
                }
            );
        }
        const getallratings = await productModel.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        let finalproduct = await productModel.findByIdAndUpdate(
            prodId,
            {
                totalrating: actualRating,
            },
            { new: true }
        );
        res.json(finalproduct);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});



module.exports = { createProduct, GetProduct, IdProducts, updateProduct, deleteProduct, rating }