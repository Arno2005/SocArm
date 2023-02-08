const User = require("../models/user");
const jwt = require("jsonwebtoken");

const bcrypt = require('bcrypt');


//mail sender
const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const path = require('path');
//const { findByIdAndRemove } = require("../models/user");

//reminder: change this too!!
const emailSecret = "armsocemsectok";

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
    //reminder: change the secret!!
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

        

        //sending mail

        const id = user._id;

        let transporter = nodemailer.createTransport({
            // host: 'localhost',
            // port: 587,
            // secure: false,
            service: 'gmail',
            auth: {
              user: 'arno2005petrosyan@gmail.com',
              pass: 'elxwaigyhzhukjah'
            }
        });

        // point to the template folder
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./views/'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views/'),
        };

        //creating token for email
        const emailToken = jwt.sign({id}, emailSecret, {
            expiresIn: 3 * 60 * 60
        });
        
        // use a template file with nodemailer
        transporter.use('compile', hbs(handlebarOptions))

        let mailOptions = {
            from: 'arno2005petrosyan@gmail.com',
            to: email,
            subject: 'Email Confirmation',
            template: 'email',
            context: {username, token: emailToken}
          };


        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });
          

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

module.exports.login_post = async (req, res) =>{
    try{
        const user = await User.findOne({email: req.body.email});
        const auth = await bcrypt.compare(req.body.password, user.password);

        if(auth){
            const token = createToken(user._id);
            res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
            res.redirect('../user/home');
        }else{
            res.status(400).render('user/login', {error: 'Invalid email/password'});
        }

        

    }catch(err){
        res.status(400).render('user/login', {error: 'Invalid email/password'});
    }
}

//user credentials edit
module.exports.updateName_post = async (req, res) =>{
    let check = await User.findOne({ username: req.body.username });
    let currUser = await User.findById(req.body.id);
    if(req.body.username == ''){
        res.redirect('../user/home');
    }
    
    else if(check ){
        if(check._id == req.body.id){
            res.redirect('../user/home');
        }else{
            res.render('user/home', {user : currUser, error: 'That username is already registered'});
        }
    }
    else{
        User.findByIdAndUpdate(req.body.id, {username: req.body.username}, function(err, user) {
            if (err) {
                console.log(err);
            }else{
                res.redirect('../user/home');
            }
        });
    }
    
}

module.exports.editPass_get = (req, res) =>{
    res.render('user/edit-pass');
}

//update pass post here
module.exports.updatePass_post = async (req, res) =>{
    let user = await User.findById(req.body.id);
    if(!user){
        res.send('no user')
    }else{
        try{
                let auth = await bcrypt.compare(req.body.password, user.password);

                if(!auth){
                    res.render('user/edit-pass', {user: user, error: "Incorrect password"});
                }
                else if(req.body.password == req.body.new_password){
                    res.render('user/edit-pass', {user: user, error: "New password cannot be the same as the old one."});
                }
                else if(req.body.new_password !== req.body.password_repeat){
                    //await user.update({password: await bcrypt.hash(req.body.new_password, 10)});
                    res.render('user/edit-pass', {user, error: "Please enter Your new password correctly in BOTH fields."});
                }
                else{
                    user.password = req.body.new_password;
                    try{
                        await user.save();
                        res.render('user/edit-pass', {user, success: "Your password has been successfully changed."});
                    }catch(err){
                        if(err.message.includes('user validation failed')){
                            res.render('user/edit-pass', {user, error: err.errors['password'].message});    
                        }else{
                            res.render('user/edit-pass', {user, error: "Something went wrong! Please contact us."});
                        }
                    } 
                }
            }catch(err){
                res.render('user/edit-pass', {user: user, error: "Error Occured, Please Try again later."});
                //console.log(Object.values(err.password).message);
            }
    }
    
     
}

module.exports.updateBio_post = async (req, res) =>{
    let user = await User.findById(req.body.id);
    try{ 
        if(!user){
            res.redirect('../user/home');
        }
        else if(req.body.bio == ''){
            res.redirect('../user/home');
        }else if(req.body.bio.length > 150){
            res.render('user/home', {user, errorBio: 'Bio cannot be contain more than 150 characters.'});
        }else{
            user.bio = req.body.bio;
            await user.save();
            res.redirect('../user/home')
        }

    }catch(err){
        if(err.message.includes('user validation failed')){
            res.render('user/home', {user, errorBio: err.errors['bio'].message});    
        }else{
            res.render('user/edit-pass', {user, errorBio: "Something went wrong! Please contact us."});
        }
    }
}

module.exports.logout_get = (req, res) =>{
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('login');
}

module.exports.verify_get = (req, res) =>{
    const token = req.params.token;

    if(token){
        //reminder: change the secret!!
        jwt.verify(token, emailSecret, async (err, decoded) =>{
            if(err){
                console.log(err.message);
                res.redirect('/');
            }else{
                User.findByIdAndUpdate(decoded.id, {is_verified: true}, function(error, user) {
                    if (error) {
                        console.log(error);
                    }else{
                        res.redirect('../home');
                    }
                });
            }
        });

    }else{
        res.redirect('/');
    }
}