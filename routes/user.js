const express=require("express");
const {handleUserSignup, handleUserLogin} = require("../controllers/user");

const router = express.Router();

router.post("/create", handleUserSignup);
router.post("/login", handleUserLogin);

module.exports = router;