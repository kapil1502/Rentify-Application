const connection=require("./databaseConfig");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const nodemailer=require("nodemailer");
require('dotenv').config();


// Utility Class providing utility function to other classes.

const secret="z5NcZ0Zv5WwwoBxtm6QiUvqfTTyWBExN";

function getToken(user) {
    return jwt.sign({
        email: user.email,
        first_name: user.f_name,
        last_name: user.l_name,
        is_seller: user.is_seller
    }, secret);
}

function verifyToken(token){
    if(token){
        return jwt.verify(token, secret);
    }
    return null;
}

function decodedToken(token){
    if(token){
        return jwt.decode(token, secret);
    }
    return null;
}

function findOne(email, queryParameter) {
    return new Promise((resolve, reject) => {
        const find = `SELECT * FROM USER WHERE ${queryParameter} = ?`;
        connection.query(find, [email], (error, result) => {
            if (error) {
                console.error("Error occurred during findOne:", error);
                reject(error);
            } else {
                if (result.length > 0) {
                    // User found
                    resolve(result[0]); // Resolve with user data
                } else {
                    // User not found
                    resolve(null);
                }
            }
        });
    });
}

function insertUser(data, table_name) {
    return new Promise((resolve, reject) => {
        const insert_query = `INSERT INTO ${table_name} (f_name, l_name, email, contact, password, isSeller) VALUES (?, ?, ?, ?, ?, ?)`;
        connection.query(insert_query, [data.f_name, data.l_name, data.email, data.contact, data.password, data.is_seller], (error, result) => {
            if (error) {
                reject("Error received during signing up: " + error);
            } else {
                if (result.affectedRows > 0) {
                    resolve("Insertion in the table named " + table_name + " is successful.");
                } else {
                    reject("Records not inserted.");
                }
            }
        });
    });
}

function verifiedUserRoute(user) {
    return new Promise((resolve, reject) => {
        const isSeller = user.isSeller;
        console.log("isSeller:", isSeller);


        if (isSeller === 1) {

            const fetchAllProperties =`SELECT *
            FROM PROPERTY
            WHERE seller_id = ?`;

            connection.query(fetchAllProperties, [user.email], (err, result) => {
                if (err) {
                    console.log("Error received when fetching all the posts for seller." + err);
                    resolve({
                        destination: "seller_dashboard",
                        posts: null,
                        status: "Posts cannot be fetched."
                    });
                } else {
                    resolve({
                        destination: "seller_dashboard",
                        posts: result,
                        status: "Successful Execution."
                    });
                }
            });

        } else {
            const fetchAllProperties = `SELECT * FROM PROPERTY`;

            connection.query(fetchAllProperties, (err, result) => {
                if (err) {
                    console.log("Error received when fetching all the posts for buyer.");
                    resolve({
                        destination: "buyer_dashboard",
                        posts: null,
                        status: "Posts cannot be fetched."
                    });
                } else {
                    resolve({
                        destination: "buyer_dashboard",
                        posts: result,
                        status: "Successful Execution."
                    });
                }
            });
        }
    });
}

function insertPost(data, table_name){
    return new Promise((resolve, reject) => {
        // Generate a unique identifier
        const uniqueId = uuidv4();

        const insert_query = `INSERT INTO ${table_name} (property_id, place, area, number_bedroom, number_bathroom, number_hospital, number_college, image, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        connection.query(insert_query, [uniqueId, data.place, data.area, data.number_bedroom, data.number_bathroom, data.number_hospital, data.number_college, data.image, data.seller_id], (error, result) => {
            if (error) {
                reject("Error received during signing up: " + error);
            } else {
                if (result.affectedRows > 0) {
                    resolve(uniqueId);
                } else {
                    reject("Records not inserted.");
                }
            }
        });
    });
};

async function hashedPassword(data){

    console.log("Data received for hashing:", data); // Log the input data

    if (!data) {
        throw new Error("Data is required to generate a hashed password");
    }

    const saltRounds=10;
    const hashedPassword=await bcrypt.hash(data, saltRounds);
    return hashedPassword;
}

async function getPropertyById(property_id) {
    return new Promise((resolve, reject) => {
        const fetchPostQuery = `SELECT * FROM PROPERTY WHERE property_id = ?`;
        connection.query(fetchPostQuery, [property_id], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

async function updatePost(property_id, data) {
    return new Promise((resolve, reject) => {
        const updatePostQuery = `
            UPDATE PROPERTY 
            SET place = ?, area = ?, number_bedroom = ?, number_bathroom = ?, number_hospital = ?, number_college = ?, image = ?
            WHERE property_id = ?
        `;
        
        const values = [
            data.place,
            data.area,
            data.number_bedroom,
            data.number_bathroom,
            data.number_hospital,
            data.number_college,
            data.image,
            property_id
        ];
        
        connection.query(updatePostQuery, values, (err, result) => {
            if (err) {
                console.log("posting cannot be updated.")
                return reject(err);
            }
            resolve(result);
        });
    });
}

async function likePost(property_id, username){
    return new Promise((resolve, reject) => {
        // Generate a unique identifier
        const uniqueId = uuidv4();

        const like_query = `INSERT INTO LIKES_PROPERTIES (like_id, property_id, buyer_id) VALUES (?, ?, ?)`;
        connection.query(like_query, [uniqueId, property_id, username], (error, result) => {
            if (error) {
                reject("Error received during liking up: " + error);
            } else {
                if (result.affectedRows > 0) {
                    resolve(uniqueId);
                } else {
                    reject("Records not inserted.");
                }
            }
        });
    });    

}

async function getLikesOnPost(property_id){
    return new Promise((resolve, reject) => {

        const like_query = `SELECT COUNT(like_id) AS likes_count FROM PROPERTY INNER JOIN LIKES_PROPERTIES ON PROPERTY.property_id=LIKES_PROPERTIES.property_id WHERE PROPERTY.property_id=? GROUP BY LIKES_PROPERTIES.property_id`;
        connection.query(like_query, [property_id], (error, result) => {
            if (error) {
                reject("Error received during liking up: " + error);
            } else {
                resolve(result);
            }
        });
    });       
}

function mailer(buyer_details, seller_details) {
    return new Promise((resolve, reject) => {
        const buyer_mail_text = `Hi ${buyer_details.f_name + " " + buyer_details.l_name},
The property you are interested in is put on sale by:
    Name: ${seller_details.f_name + " " + seller_details.l_name}
    Email: ${seller_details.email}
    Contact: ${seller_details.contact}`;

        const seller_mail_text = `Hi ${seller_details.f_name + " " + seller_details.l_name},
A buyer is interested in your property. You can check the details below:
    Name: ${buyer_details.f_name + " " + buyer_details.l_name}
    Email: ${buyer_details.email}
    Contact: ${buyer_details.contact}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const buyer_mail = {
            from: process.env.EMAIL_USER,
            to: buyer_details.email,
            subject: "Seller Information for the property you are interested in",
            text: buyer_mail_text
        };

        const seller_mail = {
            from: process.env.EMAIL_USER,
            to: seller_details.email,
            subject: "Buyer Information interested in your registered property",
            text: seller_mail_text
        };

        transporter.sendMail(buyer_mail, (err, info) => {
            if (err) {
                console.log("Error received during mail transmission: ", err);
                return reject({
                    failure: "Error received during the mail transmission.",
                    error: err
                });
            } else {
                console.log("Mail sent to buyer: ", info.response);
            }
        });

        transporter.sendMail(seller_mail, (err, info) => {
            if (err) {
                console.log("Error received during mail transmission: ", err);
                return reject({
                    failure: "Error received during the mail transmission.",
                    error: err
                });
            } else {
                console.log("Mail sent to seller: ", info.response);
                return resolve({
                    success: "Mail successfully shared with both buyer and seller."
                });
            }
        });
    });
}


module.exports = {
    findOne: findOne,
    hashedPassword: hashedPassword,
    insertUser: insertUser,
    getToken: getToken,
    verifyToken: verifyToken,
    verifiedUserRoute: verifiedUserRoute,
    insertPost: insertPost,
    decodedToken: decodedToken,
    getPropertyById: getPropertyById,
    updatePost: updatePost,
    likePost: likePost,
    getLikesOnPost: getLikesOnPost,
    mailer: mailer
}