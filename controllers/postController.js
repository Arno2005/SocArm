const User = require("../models/user");
const Post = require("../models/post");

//jwt token
const jwt = require("jsonwebtoken");
//bcrypt password hashing
const bcrypt = require('bcrypt');
//image resize
const sharp = require('sharp');
const fs = require('fs');

const path = require('path');



if(process.env.NODE_ENV !== 'production'){
	const dotenv = require('dotenv');
	dotenv.config();
}

//secrets
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
                            
                            let media_name = req.files.post_media.name.split('.');
                            let ext = media_name[media_name.length - 1];

                            media_data = req.files.post_media.data; 
                            media_type = req.files.post_media.mimetype;

                            sharp(media_data).resize(750, 850).jpeg({quality: 60}).rotate().toFile(path.resolve('./public/posts/' + post._id + '.jpeg') , (err, sharp)  =>{
                                Post.findByIdAndUpdate(post._id, {media_data: '/posts/' + post._id + '.jpeg', media_type : 'image/jpeg'} ,function (err, post){
                                    if(err){
                                        console.log(err);
                                    }
                                });

                            });
                            
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

module.exports.deletePost_post = async (req, res) => {
    const token = req.cookies.jwt
    if(!token){
        res.redirect('/user/login');
    }else{
        jwt.verify(token, userToken, async (err, decoded) => {
            if(err){
                console.log(err);
                res.redirect('/user/login');
            }else{
                let post = await Post.findById(req.body.id);
                if(post.media_data != ""){
                    fs.unlink('./public/posts/' + req.body.id + '.jpeg', async (err) => {
                        if(err){
                            // Handle specific error if any
                            if(err.code === 'ENOENT'){
                                console.error('File does not exist.');
                            }else{
                                throw err;
                            }
                        }else{
                            await Post.deleteOne({ _id: req.body.id });
                            res.redirect('/');
                        }
                    });
                }else{
                    await Post.deleteOne({ _id: req.body.id });
                    res.redirect('/');
                }
            }
            
        })
        
    }
}