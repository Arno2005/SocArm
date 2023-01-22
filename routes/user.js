var express = require('express');
var router = express.Router();

router.get('/register', (req, res) => {
    res.render('user/register');
})

router.post('/register', (req, res) =>{

});

router.get('/login', (req, res) =>{
    res.render('user/login');
})

router.post('/login', (req, res) => {

});


module.exports = router;