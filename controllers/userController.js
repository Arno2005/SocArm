const User = require("../models/user");
const jwt = require("jsonwebtoken");

//error handling
const handleErrors = (err) => {
    //console.log(err.message, err.code);
    let errors = {username: '', email: '', password: ''};

    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
           errors[properties.path] = properties.message;
        })
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({id}, 'armjwttoksec', {
        expiresIn: maxAge
    });
}

module.exports.register_get = (req, res) =>{
    if(req.cookies.jwt){
        res.redirect('../user/home');
    }else{
        res.render('user/register');
    }
    
}

module.exports.register_post = async (req, res) =>{
    try{
        const {username, email, password} = req.body;
        
        const user = await User.create({
            username, email, password
        });
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});

        //res.status(201).json({user: user._id});
        res.redirect('../user/home');
    }catch(err){
        const errors = handleErrors(err);
        res.status(400).render('user/register', {errors});
    }
}

module.exports.login_get = (req, res) =>{
    res.render('user/login');
}

module.exports.login_post = (req, res) =>{
    //res.render('/login');
}