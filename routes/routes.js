var express = require('express');
var router = express.Router();

const User = require('../models/user');

router.get('/', (req, res) => {
    res.render('index');
})


router.get('/users', async (req, res) => {
    try{
        const users = await User.find({});
        res.render('users/users', {users: users});
    }catch{
        res.redirect('/');
    }
    
})

module.exports = router;