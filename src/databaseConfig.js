require("dotenv").config();
const mysql=require("mysql");

// Used for the connection of the SQL Database.
const connection=mysql.createConnection({
    host: process.env.DATABASE_HOST_NAME,
    user: process.env.DATABASE_HOST_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
    // Creating table user if not exists already.
    const userTableQuery=`CREATE TABLE IF NOT EXISTS USER (
        f_name VARCHAR(30),
        l_name VARCHAR(30),
        email VARCHAR(100) PRIMARY KEY,
        contact INTEGER,
        isSeller TINYINT,
        password VARCHAR(300)
    )`
    const propertyTableQuery = `CREATE TABLE IF NOT EXISTS PROPERTY (
        property_id VARCHAR(300) PRIMARY KEY,
        place VARCHAR(200),
        area INTEGER,
        number_bedroom INTEGER,
        number_bathroom INTEGER,
        number_hospital INTEGER,
        number_college INTEGER,
        image BLOB,
        seller_id VARCHAR(100),
        FOREIGN KEY (seller_id) REFERENCES USER(email) ON DELETE CASCADE
    )`;

    const likesTableQuery=`CREATE TABLE IF NOT EXISTS LIKES_PROPERTIES(
        like_id VARCHAR(300) PRIMARY KEY NOT NULL,
        created TIMESTAMP NOT NULL,
        property_id VARCHAR(300) NOT NULL,
        buyer_id VARCHAR(100) NOT NULL,
        FOREIGN KEY(property_id) REFERENCES PROPERTY(property_id) ON DELETE CASCADE,
        FOREIGN KEY(buyer_id) REFERENCES USER(email) ON DELETE CASCADE,
        CONSTRAINT unique_post_user UNIQUE (property_id, buyer_id)
      )`;

    connection.query(userTableQuery, (err, result) =>{
        if(err){
            console.log("User Table is not Created");
        }
    })
    connection.query(propertyTableQuery, (err, result) =>{
        if(err){
            console.log("Property Table is not Created");
        }
    })
    connection.query(likesTableQuery, (err, result) => {
        if(err){
            console.log("Likes table is not being created."+err)
        }
    })
  });

module.exports=connection;