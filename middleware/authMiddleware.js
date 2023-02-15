const jwt = require('jsonwebtoken');

const User = require('../models/user');

if(process.env.NODE_ENV !== 'production'){
	const dotenv = require('dotenv');
	dotenv.config();
}

const requireAuth = (req, res, next) =>{
    const token = req.cookies.jwt;

    if(token){
        //reminder: change the secret!!
        jwt.verify(token, process.env.SECRET, (err, decoded) =>{
            if(err){
                console.log(err.message);
                res.redirect('/user/login');
            }else{
                next();
            }
        });

    }else{
        res.redirect('/user/login');
    }
}

const checkUser = (req, res, next) =>{
    const token = req.cookies.jwt;

    if(token){
        //reminder: change the secret!!
        jwt.verify(token, process.env.SECRET, async (err, decoded) =>{
            if(err){
                console.log(err.message);
                res.locals.user = null;
                next();
            }else{
                let user = await User.findById(decoded.id)
                if(!user){
                    res.cookie('jwt', '', {maxAge: 1});
                }else{
                    res.locals.user = user;
                }
                
                next();
            }
        });

    }else{
        res.locals.user = null;
        next();
    }
}

module.exports = {requireAuth, checkUser};