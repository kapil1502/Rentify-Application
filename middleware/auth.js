
const util=require("../src/util")

async function restrictToLoggedinUserOnly(req, res, next){

    const userUidToken = req.cookies?.uid;

    if(!userUidToken || !util.verifyToken(userUidToken)){
        return res.redirect("login", {message: "Please Login if you want to use our services."})
    }

    const decodedTokenObject=util.decodedToken(userUidToken);

    const user = await util.findOne(decodedTokenObject['email'], "email");

    if(!user){
        return res.redirect("login", {message: "Something bad happened Sorry."})
    }

    console.log(user);

    req.user=user;
    next();
}

module.exports = {
    restrictToLoggedinUserOnly: restrictToLoggedinUserOnly
}