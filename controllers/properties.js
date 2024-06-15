const connection = require("../src/databaseConfig");
const util=require("../src/util");

async function getAllPostings(req, res){
    const fetchQuery = `
    SELECT DISTINCT 
        p.property_id, 
        p.place, 
        p.area, 
        p.number_bedroom, 
        p.number_bathroom, 
        p.number_hospital, 
        p.number_college, 
        p.image, 
        jt.likes_count
    FROM PROPERTY p
    LEFT JOIN (
        SELECT 
            property_id, 
            COUNT(like_id) AS likes_count
        FROM LIKES_PROPERTIES
        GROUP BY property_id
    ) jt
    ON p.property_id = jt.property_id;
`;
    connection.query(fetchQuery, (err, result) => {
        if(err){
            console.log(err);
            res.render("login", {message: "Sorry There was an issue when listing the available properties for you."})
        }
        else{
            object=null;
            if(req.user){
               result.forEach(post => {
                 post.image=(post.image) ? post.image.toString('base64') : null;
               });

               object={
                name: req.user.f_name + req.user.l_name,
                email: req.user.email,
                posts: result
             }
            }
            res.render("buyer_dashboard",object)
        }
    })
}

async function handleAddingProperty(req, res){
    try {
        const data = {
            place: req.body.place,
            area: req.body.area,
            number_bedroom: req.body.number_bedroom,
            number_bathroom: req.body.number_bathroom,
            number_hospital: req.body.number_hospital,
            number_college: req.body.number_college,
            image: req.file ? req.file.buffer : null, // Save the file buffer if an image was uploaded
            seller_id: req.user.email
        };

        console.log(req.user);

        const result = await util.insertPost(data, "PROPERTY");

            res.render("message", {
            message: "Your Posting is once verified will be registered shortly."
        }); 

    } catch (error) {
        console.error("Error adding post:", error);
        res.status(500).send("Error adding post");
    }
}

async function renderEditingProperty(req, res){
    try {
        const property_id = req.params.property_id;
        const post = await util.getPropertyById(property_id);
        res.render('edit_post', { post: post[0] });
    } catch (err) {
        res.status(500).send("Error occurred while fetching the post: " + err.message);
    }    
}

async function handleEditingProperty(req, res){
    try {
        const property_id = req.params.property_id;
        const data = {
            place: req.body.place,
            area: req.body.area,
            number_bedroom: req.body.number_bedroom,
            number_bathroom: req.body.number_bathroom,
            number_hospital: req.body.number_hospital,
            number_college: req.body.number_college,
            image: req.file ? req.file.buffer : null
        };
        await util.updatePost(property_id, data);
        res.redirect('/seller/posts');
    } catch (err) {
        res.status(500).send("Error occurred while updating the post: " + err.message);
    }
};

async function handleRemovingProperty(req, res){
    try{
        const property_id=req.params.property_id;
        const fetchQuery=`DELETE FROM PROPERTY
        WHERE property_id=? AND seller_id=?`;
        connection.query(fetchQuery, [property_id, req.user.email], (err, result) => {
            if(err){
                res.render("message", {message: "Sorry something wrong Happended when deleting the post."})
            }
            res.redirect('/seller/posts');
        })

    } catch(err){
        res.status(500).send("Error occurred while deleting the post: " + err.message);
    }
}

async function getSellerPostings(req, res){
    const fetchQuery=`SELECT property_id, place, area, number_bedroom, number_bathroom, number_hospital, number_college, image
    FROM PROPERTY
    WHERE seller_id=?`;
    connection.query(fetchQuery, [req.user.email], (err, result) => {
        if(err){
            res.render("message", {message: "some error occured"});
        }
        else res.render("seller_dashboard", {
            name: req.user.f_name+req.user.l_name,
            email: req.user.email,
            posts: result
        });
    })
}

async function handleLikingProperty(req, res){
    const property_id=req.params.property_id;
    const username=req.user.email;
    const liking=await util.likePost(property_id, username);
    if(liking){
        const likeCount=await util.getLikesOnPost(property_id);
        obj={
            success: "Like successfully generated.",
            likes: likeCount
        }
        res.send(obj);
    } else {
    res.send({
        success: null,
        likes: -1
    })
   }
}

module.exports = {
    getAllPostings: getAllPostings,
    handleAddingProperty: handleAddingProperty,
    handleEditingProperty: handleEditingProperty,
    renderEditingProperty: renderEditingProperty,
    getSellerPostings: getSellerPostings,
    handleRemovingProperty: handleRemovingProperty,
    handleLikingProperty: handleLikingProperty
}