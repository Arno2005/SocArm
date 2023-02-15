var express = require('express');
var router = express.Router();

//Importing Models
const User = require('../models/user');
const Post = require('../models/post');


//auth middleware
const {requireAuth} = require('../middleware/authMiddleware');

//Post Controller
const postController = require('../controllers/postController.js')

router.post('/create-post',  requireAuth, postController.createPost_post);

module.exports = router;