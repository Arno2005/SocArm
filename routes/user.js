var express = require('express');
var router = express.Router();

//Importing Models
const User = require('../models/user');

//User Controller
const userController = require('../controllers/userController.js')

router.get('/register', userController.register_get);

router.post('/register', userController.register_post);

router.get('/login', userController.login_get);

router.post('/login', userController.login_post);

router.get('/home', (req, res) =>{
    res.render('user/home');
})


module.exports = router;