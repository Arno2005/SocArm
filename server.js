if(process.env.NODE_ENV !== 'production'){
	const dotenv = require('dotenv');
	dotenv.config();
}

var express = require('express');
var bcrypt = require('bcrypt');
var expressLayouts = require('express-ejs-layouts');

var indexRouter = require('./routes/routes');

var app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

app.use(express.json());
app.use(expressLayouts);
app.use(express.static('public'));
app.use('/', indexRouter);

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



