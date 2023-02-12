//Configuring env variables

if(process.env.NODE_ENV !== 'production'){
	const dotenv = require('dotenv');
	dotenv.config();
}

var express = require('express');
var expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//Add routes

var indexRouter = require('./routes/routes');
var usersRouter = require('./routes/user');



var app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

app.use(express.json());
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));
app.use(cookieParser());
app.use(fileUpload());


//checking user
const { checkUser } = require('./middleware/authMiddleware');
app.get('*', checkUser);

//Set Routees
app.use('/', indexRouter);
app.use('/user', usersRouter);

//Error 404
app.get('*', function(req, res){
    res.render('not_found');
});

//Database Connection
var mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, {
	useNewUrlParser: true, 
    //useUnifiedTopology: true,
    family: 4,
});
var db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', ()=> console.log("Connected to Database Successfully"));


var port = 3000;

app.listen(process.env.PORT || port, () =>{
	console.log(`Port: ${port}`)
})



