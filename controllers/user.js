const connection = require("../src/databaseConfig");
const util=require("../src/util")
const bcrypt=require("bcrypt");
const { getSellerPostings, getAllPostings } = require("./properties");

// Registering Users
async function handleUserSignup(req,res){

    const data={

       f_name: req.body.f_name,
       l_name: req.body.l_name,
       email: req.body.email,
       contact: req.body.contact,
       password: req.body.password,
       confirmPassword: req.body.confirmPassword,
       is_seller: req.body.is_seller ? 1 : 0,

    }

    const existing_user=await util.findOne(data.email, "email");

      // Here the user not exists in the database.
    if(existing_user == [] || existing_user == null){

        console.log(data.password);
        console.log(data.confirmPassword);

        if(data.password == data.confirmPassword){
            // encrypting the password before storing in database.
        const hashedPassword=await util.hashedPassword(data.password);

        data.password=hashedPassword;
        const result=await util.insertUser(data, "USER");
          res.render("signup", {message: "User registered with us Successfully."})
        }
        else res.render("signup", {message: "Sorry your Password didn't match."})
    }
    else{
       res.render("signup", {message: "User already exists in the database"});
    }
}

// Logging in the Users
async function handleUserLogin(req, res) {
    try {
        const username = req.body.email;

        // Checking if a valid user with this username exists or not.
        const existing_user = await util.findOne(username, "email");

        if (!existing_user) {
            console.log("User not found in the database");
            res.render("login", { message: "Sorry you are not registered with us." });
        } else {
            // Check if the user's password exists and then compare it
            if (existing_user.password) {
                console.log("User Password:", existing_user.password);
                const passwordMatch = await bcrypt.compare(req.body.password, existing_user.password.trim());
                console.log("Password Match:", passwordMatch);
                if (passwordMatch) {
                    const token = util.getToken(existing_user);
                    console.log(token);
                    res.cookie("uid", token);

                    req.user=existing_user

                    if (existing_user.isSeller) {
                        await getSellerPostings(req, res); // Call the function properly
                    } else {
                        await getAllPostings(req, res); // Call the function properly
                    }

                } else {
                    res.render("login", { message: "Bad credentials entered." });
                }
            } else {
                res.render("login", { message: "Details cannot be verified." });
            }
        }
    } catch (err) {
        res.status(400).send("Wrong details entered. " + err);
    }
};

async function handleSellerDetailsDeliveryWithNotify(req, res) {
    try {
        const property_id = req.params.property_id;
        const getSellerQuery = 'SELECT seller_id FROM PROPERTY WHERE property_id = ?';

        connection.query(getSellerQuery, [property_id], (err, result) => {
            if (err) {
                console.log("Error received when getting the seller details: ", err);
                return res.send({ failure: "Error received when getting the seller details." });
            }

            if (result.length === 0) {
                return res.send({ failure: "No seller found for the given property." });
            }

            const seller_id = result[0].seller_id;

            const sellerDetailsQuery = 'SELECT f_name, l_name, email, contact FROM USER WHERE email = ?';
            connection.query(sellerDetailsQuery, [seller_id], async (err, result) => {
                if (err) {
                    console.log("Error received when getting the seller details: ", err);
                    return res.send({ failure: "Error received when getting the seller details." });
                }

                if (result.length === 0) {
                    return res.send({ failure: "Seller details not found." });
                }

                const sellerDetails = result[0];
                try {
                    const mailing_response = await util.mailer(req.user, sellerDetails);

                    if (mailing_response.success) {
                        return res.send({
                            success: "Data successfully retrieved.",
                            seller: sellerDetails
                        });
                    } else {
                        return res.send({
                            success: "Data successfully retrieved but mail cannot be generated.",
                            seller: sellerDetails
                        });
                    }
                } catch (mailError) {
                    console.log("Error during mail transmission: ", mailError);
                    return res.send({
                        success: "Data successfully retrieved but mail cannot be generated.",
                        seller: sellerDetails
                    });
                }
            });
        });
    } catch (err) {
        res.status(400).send("Error occurred: " + err);
    }
}

module.exports = {
    handleUserSignup: handleUserSignup,
    handleUserLogin: handleUserLogin,
    handleSellerDetailsDeliveryWithNotify: handleSellerDetailsDeliveryWithNotify
}