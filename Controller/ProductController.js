const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const cloudinary = require("cloudinary").v2;
const { productModel } = require("../models/Product");
const { articleModel } = require("../models/Article");

//create product

const createProduct = asyncHandler(async (req, res) => {
    try {
        const files = req.files; // Access the array of files
        const urls = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image' },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );
                    stream.end(file.buffer);
                });

                urls.push(result.secure_url); // Save the Cloudinary URL
            }
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
            tags: req.body.tags,
            information: req.body.information // Ensure this is included
        });

        await newProduct.save();

        res.status(200).json(newProduct);
    } catch (error) {
        console.log("Error creating product:", error.message);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});





// get alls products


const GetProduct = asyncHandler(async (req, res) => {
    try {
        const { title, category, minPrice, maxPrice, sort } = req.query;

        let productQuery = {};
        let articleQuery = {};

        if (title) {
            const regex = new RegExp(title, 'i');
            productQuery.title = { $regex: regex };
            articleQuery.title = { $regex: regex };
        }

        if (category) {
            productQuery.category = category;
            articleQuery.category = category;
        }

        if (minPrice || maxPrice) {
            productQuery.price = {};
            articleQuery.price = {};
            if (minPrice) {
                productQuery.price.$gte = minPrice;
                articleQuery.price.$gte = minPrice;
            }
            if (maxPrice) {
                productQuery.price.$lte = maxPrice;
                articleQuery.price.$lte = maxPrice;
            }
        }

        let productSort = {};
        let articleSort = {};

        if (sort) {
            switch (sort) {
                case 'Popular':
                    productSort.totalrating = -1;
                    articleSort.totalrating = -1;
                    break;
                case 'Newest':
                    productSort.createdAt = -1;
                    articleSort.createdAt = -1;
                    break;
                case 'HighestToLowestPrice':
                    productSort.price = -1;
                    articleSort.price = -1;
                    break;
                case 'LowestToHighestPrice':
                    productSort.price = 1;
                    articleSort.price = 1;
                    break;
                default:
                    break;
            }
        }

        const productsPromise = productModel.find(productQuery).sort(productSort);
        const articlesPromise = articleModel.find(articleQuery).sort(articleSort);

        const [products, articles] = await Promise.all([productsPromise, articlesPromise]);

        if (products.length === 0 && articles.length === 0) {
            return res.status(400).json({
                status: 'Fail',
                results: 0,
                message: 'No Data Found',
                data: [],
            });
        }

        // Combine the results
        const combinedResults = [...products, ...articles];

        res.status(200).json({
            status: 'success',
            results: combinedResults.length,
            data: combinedResults,
        });
    } catch (error) {
        console.error("Error:", error.message); // Log error for debugging
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
    const { star, id, comment, type } = req.body;

    try {
        let model;

        if (type === "product") {
            model = productModel;
        } else if (type === "article") {
            model = articleModel;
        } else {
            return res.status(400).json({ message: 'Invalid type provided' });
        }

        const item = await model.findById(id);
        if (!item) {
            return res.status(404).json({ message: `${type} not found` });
        }

        if (!item.ratings || item.ratings.length === 0) {
            item.ratings = [];
        }

        let alreadyRated = item.ratings.find(
            (rating) => rating.postedby && rating.postedby.toString() === _id.toString()
        );

        if (alreadyRated) {
            await model.updateOne(
                {
                    _id: id,
                    "ratings._id": alreadyRated._id,
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": comment },
                },
                { new: true }
            );
        } else {
            await model.findByIdAndUpdate(
                id,
                {
                    $push: {
                        ratings: {
                            star: star,
                            comment: comment,
                            postedby: req.user.id,
                        },
                    },
                },
                { new: true }
            );
        }

        const updatedItem = await model.findById(id)
            .populate('ratings.postedby', 'name email image');

        const ratingSum = updatedItem.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0);

        const finalItem = await model.findByIdAndUpdate(
            id,
            {
                totalrating: ratingSum.toString(),
            },
            { new: true }
        ).populate('ratings.postedby', 'name email image');

        res.json(finalItem);
    } catch (error) {
        console.log("error ==>", error.message);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

// get all rating
const getRating = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { Id, type } = req.body;

    try {
        let model;

        if (type === "product") {
            model = productModel;
        } else if (type === "article") {
            model = articleModel;
        } else {
            return res.status(400).json({ message: 'Invalid type provided' });
        }

        const item = await model.findById(Id).populate('ratings.postedby', 'name email image');
        if (!item) {
            return res.status(404).json({ message: `${type} not found` });
        }

        // // Safely find the rating by the current user
        const userRating = item.ratings.find(
            (rating) => rating?.postedby?._id?.toString() === id.toString()
        );


        if (!userRating) {
            return res.status(404).json({ message: 'User rating not found' });
        }

        res.json({
            userRating: {
                star: userRating.star,
                comment: userRating.comment,
                postedby: userRating.postedby,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});





module.exports = { createProduct, GetProduct, IdProducts, updateProduct, deleteProduct, rating, getRating }