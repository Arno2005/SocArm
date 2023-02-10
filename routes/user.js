var express = require('express');
var router = express.Router();

//Importing Models
const User = require('../models/user');

//auth middleware
const {requireAuth} = require('../middleware/authMiddleware');

//User Controller
const userController = require('../controllers/userController.js')

router.get('/register', userController.register_get);
router.post('/register', userController.register_post);


router.get('/login', userController.login_get);
router.post('/login', userController.login_post);


router.get('/verify/:token', userController.verify_get);


router.get('/home', requireAuth , (req, res) =>{
    res.render('user/home', {message: "Test Message"});
});

router.get('/logout', requireAuth , userController.logout_get);

router.post('/update-name', requireAuth , userController.updateName_post);

router.post('/update-bio', requireAuth , userController.updateBio_post);


router.get('/edit-pass', requireAuth , userController.editPass_get);
router.post('/edit-pass', requireAuth, userController.updatePass_post);

router.get('/delete', requireAuth, userController.deleteAcc_get);
router.post('/delete', requireAuth, userController.deleteAcc_post);

module.exports = router;