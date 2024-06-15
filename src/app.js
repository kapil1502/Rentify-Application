require("dotenv").config();
const express=require("express");
const util=require("./util");
const connection=require("./databaseConfig");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");

const app=express();

// Converting the data into json format
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cookieParser());

const userRoute=require("../routes/user");
const staticRoutes=require("../routes/staticRoutes");
const restrictedRoutes = require("../routes/restrictedRoutes");
const seller = require("../routes/seller");
const buyer=require("../routes/buyer");

app.use("/user", userRoute);
app.use("/", staticRoutes);
app.use("/verified",  auth.restrictToLoggedinUserOnly, restrictedRoutes);
app.use("/seller", auth.restrictToLoggedinUserOnly, seller);
app.use("/buyer", auth.restrictToLoggedinUserOnly, buyer);

// Using ejs as view engine.
app.set('view engine', 'ejs');
app.use(express.static("public"));

const port=process.env.PORT;

app.get('/seller/posts/add', async (req, res) => {
    res.render('new_post');
})

app.listen(port, ()=>{
    console.log(`Server running at the port ${port}`);
});