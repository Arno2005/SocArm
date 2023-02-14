const User = require("../models/user");

//jwt token
const jwt = require("jsonwebtoken");
//bcrypt password hashing
const bcrypt = require('bcrypt');
//image resize
const sharp = require('sharp');

if(process.env.NODE_ENV !== 'production'){
	const dotenv = require('dotenv');
	dotenv.config();
}

//mail sender
const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const path = require('path');

//reminder: change this too!!
const userToken = process.env.SECRET;
const emailSecret = process.env.EMAIL_SECRET;

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
    return jwt.sign({id}, userToken, {
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

        const image = Buffer.from('/9j/4AAQSkZJRgABAQEBLAEsAAD/4QBWRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAAAAAEsAAAAAQAAASwAAAAB/+0ALFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAPHAFaAAMbJUccAQAAAgAEAP/hDIFodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkJz8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0nYWRvYmU6bnM6bWV0YS8nIHg6eG1wdGs9J0ltYWdlOjpFeGlmVG9vbCAxMC4xMCc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczp0aWZmPSdodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyc+CiAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICA8dGlmZjpYUmVzb2x1dGlvbj4zMDAvMTwvdGlmZjpYUmVzb2x1dGlvbj4KICA8dGlmZjpZUmVzb2x1dGlvbj4zMDAvMTwvdGlmZjpZUmVzb2x1dGlvbj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wTU09J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8nPgogIDx4bXBNTTpEb2N1bWVudElEPmFkb2JlOmRvY2lkOnN0b2NrOjFlMjI3NGQ0LTk1MGEtNGY3ZC04NTQzLWRhMGRlYzE3Mjk2NDwveG1wTU06RG9jdW1lbnRJRD4KICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjFjZTYxODdjLTRkMDgtNGMzYy04MDU1LTY2OWVlODJiZjRiMDwveG1wTU06SW5zdGFuY2VJRD4KIDwvcmRmOkRlc2NyaXB0aW9uPgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSd3Jz8+/9sAQwAFAwQEBAMFBAQEBQUFBgcMCAcHBwcPCwsJDBEPEhIRDxERExYcFxMUGhURERghGBodHR8fHxMXIiQiHiQcHh8e/9sAQwEFBQUHBgcOCAgOHhQRFB4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4e/8AAEQgBaAFoAwEiAAIRAQMRAf/EABwAAQADAQEBAQEAAAAAAAAAAAAFBgcEAwECCP/EAEIQAQABAwICAwwHBwQCAwAAAAABAgMEBREGIRIxQQcTIlFhcYGRobHB0RQWMkJVYnIjM0NS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', 'base64');
        
        const user = await User.create({
            username, email, password, picture: image, picture_type: 'image/jpeg',
        });
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});

        

        //sending mail

        const id = user._id;

        let transporter = nodemailer.createTransport({
            // host: 'localhost',
            // port: 587,
            service: 'gmail',
            auth: {
              user: process.env.USER,
              pass: process.env.PASS
            }
        });

        // point to the template folder
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./views/other'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views/other'),
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
        if(req.body.username.length > 15){
            res.render('user/home', {user : currUser, error: 'Username cannot contain more than 10 characters.'});
        }else{
            User.findByIdAndUpdate(req.body.id, {username: req.body.username}, function(err, user) {
                if (err) {
                    console.log(err);
                }else{
                    res.redirect('../user/home');
                }
            });    
        }
        
    }
    
}




module.exports.updatePicture_post = async (req, res) =>{
    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if(req.files && imageMimeTypes.includes( req.files.picture.mimetype )){

        const token = req.cookies.jwt;

        if(token){
            //reminder: change the secret!!
            jwt.verify(token, userToken, async (err, decoded) =>{
                if(err){
                    console.log(err.message);
                    res.redirect('/');
                }else{
                    sharp(req.files.picture.data).resize(250, 250).png({quality: 90}).withMetadata().rotate().toBuffer().then((processedPicture)  =>{

                    

                            User.findByIdAndUpdate(decoded.id, {picture: processedPicture, picture_type: req.files.picture.mimetype}, function(error, user) {
                                if (error) {
                                    console.log(error);
                                    res.redirect('../user/home');
                                }else{
                                    res.redirect('../user/home');
                                }
                            });
                    });
                        
                    
                }
            });
    
        }else{
            
            res.redirect('/');
        }
    }else{
        //res.send(req.files.picture);
        res.redirect('../user/home');
    };
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
        }else if(req.body.bio.length > 150){
            res.render('user/home', {user, errorBio: 'Bio cannot be contain more than 150 characters.'});
        }else{
            User.findByIdAndUpdate(user.id, {bio: req.body.bio.trim()},  function(error, user) {
                if (error) {
                    res.render('user/home', {user, errorBio: 'Something went wrong! Please contact us.'});
                    console.log(error);
                }else{
                    res.redirect('../user/home');
                }
            });
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


module.exports.deleteAcc_get = async (req, res) =>{
    res.render('user/delete-acc');
}

module.exports.deleteAcc_post = async (req, res) =>{
    const token = req.cookies.jwt;
    const user = await User.findById(req.body.id);
    jwt.verify(token, userToken, async (err, decoded) =>{
        if(req.body.password !== req.body.password_repeat || req.body.password == '' || req.body.password_repeat == ''){
            res.render('user/delete-acc', {user, error: 'Please enter Your password correctly in BOTH fields.'}); 
        }else{
            try{
                const auth = await bcrypt.compare(req.body.password, user.password);
                if(!auth){
                    res.render('user/delete-acc', {user, error: 'Incorrect Password'});
                }else{
                    if(err || req.body.id != decoded.id){
                        res.render('user/delete-acc', {user, error: 'Could not verify the user!'});
                    }else{
                        User.findByIdAndDelete(decoded.id, function(error, userFind) {
                            if (error) {
                                res.render('user/delete-acc', {user, error: 'Could not verify the user!'});
                            }else{
                                res.cookie('jwt', '', {maxAge: 1});
                                res.redirect('login');
                            }
                        });
                    }
                }
            }
            catch(err){
                res.render('user/delete-acc', {user, error: 'Something went wrong!'});
            }
        }
        
    });
}