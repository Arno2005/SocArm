const User = require("../models/user");
const Post = require("../models/post");

//jwt token
const jwt = require("jsonwebtoken");
//bcrypt password hashing
const bcrypt = require('bcrypt');
//image resize
const sharp = require('sharp');

const path = require('path');



if(process.env.NODE_ENV !== 'production'){
	const dotenv = require('dotenv');
	dotenv.config();
}

//secters
const userToken = process.env.SECRET;
const emailSecret = process.env.EMAIL_SECRET;

module.exports.createPost_post = async (req, res) => {
    const token = req.cookies.jwt
    if(!token){
        res.redirect('/user/login');
    }else{
        jwt.verify(token, userToken, async (err, decoded) => {
            if(err){
                console.log(err);
                res.redirect('/user/login');
            }else{
                if(!req.body.post_description){
                    res.redirect('/');
                    //res.send(req.files.post_media);
                }else{
                    const description = req.body.post_description;
                    const user_id = decoded.id;

                    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

                    let media_data = '';
                    let media_type = '';

                    try{
                        const post = await Post.create({
                            media_data, media_type, description, user_id
                        });

                        if(req.files && imageMimeTypes.includes(req.files.post_media.mimetype)){
                            media_data = req.files.post_media.data; 
                            media_type = req.files.post_media.mimetype;

                            sharp(media_data).resize(750, 850).jpeg({quality: 60}).rotate().toBuffer().then((processedPicture)  =>{
                                Post.findByIdAndUpdate(post._id, {media_data: processedPicture, media_type : 'image/jpeg'} ,function (err, post){
                                    if(err){
                                        console.log(err);
                                    }
                                });

                            }).catch( err => { console.log(err) });
                            
                        }

                        res.redirect('/');
                    }catch(err){
                        console.log(err);
                        res.redirect('/');
                    }

                    
                

                }    
            }
            
        })
        
    }
}