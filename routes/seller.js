const express=require("express");
const {handleAddingProperty, handleEditingProperty, renderEditingProperty, getSellerPostings, handleRemovingProperty} = require("../controllers/properties");
const multer = require("multer");
const router=express.Router();

const storage = multer.memoryStorage(); // Store file in memory buffer
const upload = multer({ storage: storage });

router.post("/posts/add", upload.single('image'), handleAddingProperty);
router.post("/posts/edit/:property_id", upload.single('image'), handleEditingProperty);
router.get("/posts/delete/:property_id", handleRemovingProperty)
router.get("/posts/edit/:property_id", renderEditingProperty);
router.get("/posts/",getSellerPostings);

module.exports=router;