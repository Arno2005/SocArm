const User = require("../models/user");

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

module.exports.register_get = (req, res) =>{
    res.render('user/register');
}

module.exports.register_post = async (req, res) =>{
    try{
        const {username, email, password} = req.body;

        const user = await User.create({
            username, email, password
        });

        res.status(201).json(user);
        //res.status(201).render('/user/home', {user: user})
    }catch(err){
        const errors = handleErrors(err);
        res.render('user/register', {errors: errors});
    }
}

module.exports.login_get = (req, res) =>{
    res.render('user/login');
}

module.exports.login_post = (req, res) =>{
    //res.render('/login');
}