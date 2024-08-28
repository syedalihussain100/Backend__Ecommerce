const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Order = require("../models/Order")
const { productModel } = require("../models/Product")
const uniqid = require("uniqid");
const Cart = require("../models/Cart");

// register
const CreateUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        passport.authenticate('local')(req, res, () => {
            return res.json({ message: 'User created and logged in successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});
//login

const login = asyncHandler(async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        req.logIn(user, (err) => {
            if (err) {
                console.error(err);
                return next(err);
            }

            // Generate a JWT
            const token = jwt.sign({ id: user._id, role: user.role }, '123456789abc12345', { expiresIn: '1h' });
            return res.json({ message: 'Logged in successfully', token, user });
        });
    })(req, res, next);
});


// forget password

const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

        // Set the reset code and expiration date on the user
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

        await user.save();

        // Send an email with the reset code
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            to: user.email,
            from: user.email,
            subject: 'Password Reset Code',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Here is your password reset code:\n\n
            ${resetCode}\n\n
            Please use this code within the next hour to reset your password.\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset code sent to email', code: resetCode });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


//reset password
const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { code, password } = req.body;

        const user = await User.findOne({
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Reset code is invalid or has expired' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear the reset code fields
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// get all users

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const user = await User.find({}).select('-password');

        if (!user || user.length === 0) {
            return res.status(400).send({ message: "Users Not Found" })
        }

        res.status(200).send(user)
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
})


// update user

const updatedUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { name, email } = req.body;

    try {

        if (!name && !email) {
            return res.status(400).send({ message: "All Field Required" })
        }
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                name: name,
                email: email,
            },
            {
                new: true,
            }
        ).select("-password");
        res.status(200).send({ message: "User has been Updated", updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// delete user

const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        if (!deleteaUser) {
            return res.status(400).send({ message: "User Not Found" })
        }
        res.status(200).send({
            message:
                deleteaUser,
        });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// get details user

const userDetailsCtl = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // userValidId(id);
    try {
        const userDetails = await User.findById(id).select('-password');

        if (!userDetails) {
            return res.status(400).send({ message: "User Not Found" });
        }

        res.status(200).send({ message: userDetails });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});



// user cart
const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { id } = req.user;

    try {
        let products = [];
        const user = await User.findById(id);
        const alreadyExistCart = await Cart.findOne({ orderby: user.id });
        if (alreadyExistCart) {
            await alreadyExistCart.deleteOne();
        }

        for (let i = 0; i < cart?.length; i++) {
            console.log("cart item:", cart[i]);

            let object = {};
            object.product = cart[i].product;
            object.count = cart[i].count;

            let getPrice = await productModel.findById(cart[i].product).select("price").exec();
            if (!getPrice) {
                return res.status(404).json({ message: `Product not found for ID: ${cart[i].product}` });
            }

            object.price = getPrice.price;
            products.push(object);
        }

        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal += products[i].price * products[i].count;
        }

        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?.id,
        }).save();

        res.json(newCart);
    } catch (error) {
        console.log("error", error.message)
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

//getUserCart

const getUserCart = asyncHandler(async (req, res) => {
    const { id } = req.user;
    try {
        const cart = await Cart.findOne({ orderby: id }).populate(
            "products.product"
        );

        if (!cart) {
            return res.status(400).send("No Cart")
        }
        return res.status(200).send(cart);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

//   empty cart
const emptyCart = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { productIds } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const cart = await Cart.findOne({ orderby: user._id });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.products = cart.products.filter(product => !productIds.includes(product.product.toString()));

        cart.cartTotal = cart.products.reduce((acc, item) => acc + item.price * item.count, 0);

        await cart.save();

        res.status(200).json({ message: "Selected products have been removed from your cart", cart });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


// order create
const createOrder = asyncHandler(async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findById(id);
        let userCart = await Cart.findOne({ orderby: user._id });
        let finalAmout = 0;
        finalAmout = userCart.cartTotal;

        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmout,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "usd",
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery",
        }).save();
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } },
                },
            };
        });
        const updated = await productModel.bulkWrite(update, {});
        res.json({ message: "success" });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


//get orders
const getOrders = asyncHandler(async (req, res) => {
    const { id } = req.user;
    try {
        const userorders = await Order.findOne({ orderby: id })
            .populate("products.product")
            .populate("orderby", ["_id", "name", "email"])
            .exec();
        res.json(userorders);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

const getOrderByUserId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const userorders = await Order.findOne({ orderby: id })
            .populate("products.product")
            .populate("orderby", ["_id", "name", "email"])
            .exec();
        res.json(userorders);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const alluserorders = await Order.find()
            .populate("products.product")
            .populate("orderby", ["_id", "name", "email"])
            .exec();
        res.json(alluserorders);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOrder = await Order.findByIdAndDelete(id);
        if (!deleteOrder) {
            return res.status(400).send({ message: "Order Not Found" })
        }
        res.status(200).send({
            message: "Your Order has been deleted",
            deleteOrder,
        });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

// update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
        // Find the order by ID
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the order status and payment intent status
        order.orderStatus = status;
        order.paymentIntent.status = status;

        // Save the updated order
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});


module.exports = {
    CreateUser,
    login,
    forgotPassword,
    resetPassword,
    getAllUsers,
    updatedUser,
    deleteaUser,
    userDetailsCtl,
    createOrder,
    getAllOrders,
    getOrders,
    deleteOrder,
    userCart,
    getUserCart,
    emptyCart,
    updateOrderStatus,
    getOrderByUserId
}
