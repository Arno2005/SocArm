var express = require('express');
var router = express.Router();

const {requireAuth} = require('../middleware/authMiddleware')

const User = require('../models/user');
const Post = require('../models/post');

router.get('/', async (req, res) => {
    let isLogged = false;
    
    if(req.cookies.jwt){
        isLogged = true;
    }

    const posts = await Post.find({});
    const users = await User.find({});

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