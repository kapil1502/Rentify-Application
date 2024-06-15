const express=require("express");
const router = express.Router();

router.get("/", (req, res) =>{
    res.render("login", {message: null});
})

router.get("/signup", (req, res) =>{
    res.render("signup", {message: null});
})

module.exports = router;