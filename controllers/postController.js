const Post = require("../models/post");

//jwt token
const jwt = require("jsonwebtoken");
//bcrypt password hashing
const bcrypt = require('bcrypt');
//image resize
const sharp = require('sharp');
const fs = require('fs');

//env variables
if(process.env.NODE_ENV !== 'production'){
	const dotenv = require('dotenv');
	dotenv.config();
}

//aws
const AWS = require('aws-sdk');


const path = require('path');


// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION,
});

const s3 = new AWS.S3();

//secrets
const userToken = process.env.SECRET;

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

                            const resizedImage = sharp(media_data).resize(750, 850).jpeg({quality: 60}).rotate();

                            const filename = post._id + '.jpeg';

                            const params = {
                                Bucket: process.env.AWS_BUCKET_NAME,
                                Key: filename,
                                Body: resizedImage,
                                ContentType: media_type,
                                ACL: 'public-read',
                            };
                          
                              try{
                                await s3.upload(params).promise();

                                Post.findByIdAndUpdate(post._id, {media_type : 'image/jpeg'} ,function (err, post){
                                    if(err){
                                        console.log(err);
                                    }
                                });
                                
                              }catch(err){
                                console.log(err);
                              }
                            
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
                if(post.media_type != ""){

                    const params = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: req.body.id + ".jpeg",
                    };
                    
                    // Delete the file from the S3 bucket
                    s3.deleteObject(params, async (err, data) => {
                        if (err) {
                          console.error('Error deleting file from S3:', err);
                          return res.status(500).send('Internal Server Error');
                        }
                        await Post.deleteOne({ _id: req.body.id });
                        res.redirect('/');
                    });

                }else{
                    await Post.deleteOne({ _id: req.body.id });
                    res.redirect('/');
                }
            }
            
        })
        
    }
}