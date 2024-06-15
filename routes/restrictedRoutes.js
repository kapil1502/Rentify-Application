const express=require("express");
const {getAllPostings} = require("../controllers/properties");
const router=express.Router();

router.get("/allPostings", getAllPostings);

module.exports = router;