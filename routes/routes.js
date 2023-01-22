var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
})

router.get('/users', (req, res) => {
    res.render('users/users');
})

module.exports = router;