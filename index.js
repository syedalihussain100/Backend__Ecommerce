const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3000;
const morgan = require("morgan");
const cors = require("cors");
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require("path")

dotenv.config();

// Initialize Passport.js
require("./config/pasport");


///routes import here
const UserRoute = require("./Routes/Auth");
const ProductRoute = require("./Routes/ProductRoute");
const CategoryRoute = require("./Routes/CategoryRoute");
const ArticleRoute = require("./Routes/ArticleRoute");
const ContactRoute = require("./Routes/ContactRoute");

app.use(session({
    secret: '123456789abcdefghijklmnop', // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));


// middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
app.use("*", cors());
app.use(
    cors({
        origin: ["http://localhost:3000", "https://backend-ecommerce-3b0p.onrender.com"],
        credentials: true
    })
)
app.use(passport.initialize());
app.use(passport.session());
app.use(
    "/images/",
    express.static(path.resolve(__dirname, "public", "images"))
);


// routes middleware calling here
app.use("/app/v1", UserRoute);
app.use("/app/v1", ProductRoute);
app.use("/app/v1", CategoryRoute);
app.use("/app/v1", ArticleRoute);
app.use("/app/v1", ContactRoute);


app.get("/", (req, res) => {
    res.status(200).send("Backend Data")
})



app.use((req, res) => {
    res.status(404).send("Page Not Found!");
});



mongoose.connect(process.env.MONGODB).then(() => {
    console.log("Database Connected");
}).catch((err) => console.log(err));



// server running

app.listen(process.env.PORT, () => {
    console.log(`Your Server is Running on this! ${PORT}`);
});