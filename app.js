if (process.env.NODE_ENV !== "production") { //environment variable
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
//local dependencies
const ErrorClass = require('./errorUtils/ErrorClass');
const User = require('./models/userModel');
// 
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/ev-plug';
// const dbURL = 'mongodb://localhost:27017/ev-plug';
//routes
const stationRoutes = require('./routes/stationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

mongoose.connect(dbURL);
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
    console.log("Database connected");
});

const app = express();
//setting up ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
// setting up ejs-mate
app.engine('ejs', ejsMate);
//setting up static files
app.use(express.static(path.join(__dirname, 'public')));


const secret = process.env.SESSION_SECRET || 'thisshouldbeabettersecret!'
const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: dbURL,
        touchAfter: 24 * 60 * 60
    }),
    name: 'brokenbypass',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // secure: true,
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));
//setting up flash
app.use(flash());
// app.use((req, res, next) => {
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     res.locals.currentUser = req.user;
//     // console.log(currentUser);
//     next();
// })
//setting up passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//middleware for post, put and delete routes
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(mongoSanitize());

app.use((req, res, next) => {
    // console.log(req.session);
    // if (!['/login', '/', '/register'].includes(req.originalUrl)) {
    //     req.session.returnTo = req.originalUrl;
    // }
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user; //req.user is for JS and currentUser for templates
    next();
})

app.get('/', (req, res) => {
    res.render('home');
});

//routes - stations
app.use('/stations', stationRoutes);
//routes - reviews
//this is something weird about router, it will not be able to get this id. To make it work set {mergeParams: true}
app.use('/stations/:id/reviews', reviewRoutes);
//routes - users
app.use('/', userRoutes);


app.all('*', (req, res, next) => {
    next(new ErrorClass('Page Not Found', 404));
})




//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!';
    res.status(statusCode).render('errorTemplate', { err });
    // const { statusCode = 500, message = 'Something went wrong' } = err;
    // res.status(statusCode).render('errorTemplate', { statusCode, message });
    // res.status(statusCode).send(message);
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
})


