const mongoose = require("mongoose");

var cartSchema = new mongoose.Schema(
    {
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                article: { type: mongoose.Schema.Types.ObjectId, ref: "ARTICLE" },
                count: Number,
                price: Number
            }
        ],
        cartTotal: {
            type: Number,
            required: true,
        },
        orderby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;


















// const mongoose = require("mongoose"); // Erase if already required

// // Declare the Schema of the Mongo model
// var cartSchema = new mongoose.Schema(
//   {
//     products: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//         },
//         count: Number,
//         price: Number,
//       },
//     ],
//     cartTotal: Number,
//     orderby: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// //Export the model
// module.exports = mongoose.model("Cart", cartSchema);