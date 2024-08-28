const express = require("express");
const router = express.Router();
const { CreateUser, login,forgotPassword,resetPassword,getAllUsers,updatedUser,deleteaUser,userDetailsCtl,createOrder,getAllOrders,deleteOrder,userCart,getUserCart,emptyCart,getOrders,updateOrderStatus} = require("../Controller/User");
const { checkRole, verifyToken } = require("../middleware/authMiddleware");


router.route("/register").post(CreateUser);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/users").get( verifyToken, checkRole(['user', 'admin']),getAllUsers);
router.route("/update-user").put( verifyToken, checkRole(['user', 'admin']),updatedUser);
router.route("/delete-user/:id").delete( verifyToken, checkRole(['user', 'admin']),deleteaUser);
router.route("/user-details/:id").get( verifyToken, checkRole(['user', 'admin']),userDetailsCtl);
router.route("/order").post( verifyToken, checkRole(['user', 'admin']),createOrder);
router.route("/orders").get( verifyToken, checkRole(['user', 'admin']),getAllOrders);
router.route("/getorders").get( verifyToken, checkRole(['user', 'admin']),getOrders);
router.route("/orderstatus/:id").put( verifyToken, checkRole(['admin']),updateOrderStatus);
router.route("/order/:id").delete( verifyToken, checkRole(['user', 'admin']),deleteOrder);
router.route("/cart").post( verifyToken, checkRole(['user', 'admin']),userCart);
router.route("/cart").get( verifyToken, checkRole(['user', 'admin']),getUserCart);
router.route("/cart").delete( verifyToken, checkRole(['user', 'admin']),emptyCart);


module.exports = router