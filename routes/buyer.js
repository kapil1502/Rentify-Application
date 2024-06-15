const express=require("express");
const router=express.Router();
const {handleLikingProperty, getAllPostings}=require("../controllers/properties");
const {handleSellerDetailsDeliveryWithNotify}=require("../controllers/user");

router.post("/like-post/:property_id", handleLikingProperty);
router.get("/seller-details/:property_id", handleSellerDetailsDeliveryWithNotify);
router.get("/posts", getAllPostings);

module.exports=router;