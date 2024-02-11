var express = require('express');
var router = express.Router();

const {requireAuth} = require('../middleware/authMiddleware')

const User = require('../models/user');
const Post = require('../models/post');

const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION,
});

const s3 = new AWS.S3();

router.get('/', async (req, res) => {
    let isLogged = false;
    
    if(req.cookies.jwt){
        isLogged = true;
    }

    var posts = await Post.find({});
    const users = await User.find({});

    let media = [];

    async function getSignedUrl(params){
        return new Promise((resolve,reject) => {
          s3.getSignedUrl('getObject', params, (err, url) => {
            if (err) reject(err);
            resolve(url);
          });
    });
    }

    for(let i = 0; i < posts.length; i++) {
        if(posts[i].media_type){
            var params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: posts[i].id + '.jpeg',
            };
            
            const signedUrl = await getSignedUrl(params);
            posts[i].media_data = signedUrl;
            
        }
    };


    res.render('other/index', {isLogged, posts, users});
});


router.get('/users', requireAuth ,async (req, res) => {
    try{
        const users = await User.find({});
        res.render('users/users', {users: users});
    }catch{
        res.redirect('/');
    }
    
})

router.get('/users/display/:id', requireAuth ,async (req, res) => {
    try{
        const displayUser = await User.findById(req.params.id);

        res.render('users/display-user', {displayUser});
    }catch{
        res.redirect('/');
    }
    
})


module.exports = router;