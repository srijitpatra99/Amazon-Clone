const path = require("path");//core module

//3rd party packges
const express = require("express");
const csrf = require('csurf');
const bodyParser=require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require("multer");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require('./controllers/error');

const User = require('./models/user');
// const MONGO_URI = 'mongodb+srv://Itssrijit099:kXShN2WNfaw47rd@cluster0.kxhyp.mongodb.net/shop';
const MONGO_URI="mongodb://localhost:27017";

const app=express();// express obj for using its functionalities

const csrfProtection = csrf();

const store = new MongoDbStore({
    uri: MONGO_URI,
    collection: 'sessions'//name of collection in db where sessions will be stored
});

const fileFilter = (req, file, cb) =>{
    if( file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' )
    {
        cb( null , true);
    }
    else{
        cb(null , false);
    }
};
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'images')
    },
    filename: (req, file, cb) =>{
        cb(null , new Date().toISOString + '-' + file.originalname);
    }
});

app.set('view engine' , 'ejs');
app.set('views' , 'views');

//catch all favicon get request and return it to 204(no content status code)
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(multer( {storage:fileStorage, fileFilter: fileFilter} ).single('image'));
app.use(bodyParser.urlencoded({extended: false}));

app.use('/images', express.static(path.join(__dirname , 'images')));
app.use(express.static(path.join(__dirname , 'public')));//this middleware is used to create a path link statically to our folder (Here public folder) 

app.use(
    session({
        secret:"my secret" , 
        resave:false , 
        saveUninitialized:false,
        store: store
    })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next)=>{
    if(!req.session.user)
    {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user =>{
            if(!user)
            {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err =>{
            throw new Error(err);
        });
});

app.use((req , res , next) =>{
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(authRoutes);
app.use(adminRoutes);
app.use(shopRoutes);

app.use('/500' , errorController.get500);
app.use(errorController.get404);

//express.js error handling middleware
app.use((error , req, res, next) =>{
    console.log(error);
    res.redirect('/500');
});

mongoose.connect(MONGO_URI)
        .then(result =>{
            console.log('connected');
            app.listen('3000');
        })
        .catch(err =>{
            console.log(err);
        });
