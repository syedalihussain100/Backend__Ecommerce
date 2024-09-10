const { articleModel } = require("../models/Article");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const cloudinary = require("cloudinary").v2;

const fs = require("fs");


// create article
const createArticle = asyncHandler(async (req, res) => {
    try {
        let imageUrl = null;
        const file = req.file;

        if (file) {
            // Use upload_stream directly and handle the stream properly
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

                stream.end(file.buffer); // Send the buffer to the stream
            });

            imageUrl = result.secure_url; // Get the URL from the uploaded image
            // console.log("cloud upload", result); // Log the result object
        }


        const { title, price, category, quantity } = req.body;
        if (!title  || !price || !category || !quantity) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const slug = slugify(title);

        const existingProduct = await articleModel.findOne({ slug });
        if (existingProduct) {
            return res.status(400).json({ message: 'Article with this title already exists' });
        }

        const newProduct = await articleModel({
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            quantity: req.body.quantity,
            image: imageUrl || "",
            link: req.body.link,
            tags: req.body.tags,
            color: req.body.color
        })

        await newProduct.save();

        res.status(200).json(newProduct);
    } catch (error) {
        console.log("error", error.message)
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// get article 
const GetAllArticle = asyncHandler(async (req, res) => {
    try {
        // Filtering
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = articleModel.find(JSON.parse(queryStr));

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
        const limit = req.query.limit * 1;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Handling out-of-bound pages
        const articleCount = await articleModel.countDocuments();
        if (skip >= articleCount) throw new Error("This page does not exist");

        // Execute the query
        const articles = await query;

        // Send response
        res.status(200).json({
            status: 'success',
            results: articles.length,
            data: articles,
        });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

//getid article

const IdArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const getIdArtcle = await articleModel.findById(id);
        if (!getIdArtcle) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.status(200).send(getIdArtcle);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
})

// delete article
const deleteArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleteArticle = await articleModel.findOneAndDelete({ _id: id });
        if (!deleteArticle) {
            return res.status(400).send({ message: "Article Not Found" })
        }
        res.json(deleteArticle);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

// update article


const updateArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const updatedArticle = await articleModel.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true, // This ensures that validation runs during the update
        });

        if (!updatedArticle) {
            return res.status(404).json({ message: "Article not found" });
        }

        res.json(updatedArticle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});




// create rating

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const article = await articleModel.findById(prodId);
        let alreadyRated = article.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString()
        );
        if (alreadyRated) {
            const updateRating = await articleModel.updateOne(
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
            const rateProduct = await articleModel.findByIdAndUpdate(
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
        const getallratings = await articleModel.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        let finalarticle = await articleModel.findByIdAndUpdate(
            prodId,
            {
                totalrating: actualRating,
            },
            { new: true }
        );
        res.json(finalarticle);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

module.exports = { createArticle, GetAllArticle, IdArticle, deleteArticle, updateArticle, rating }