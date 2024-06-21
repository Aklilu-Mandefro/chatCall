const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const upload = require('express-fileupload');
const userRouter = require('./routes/userRouters');

const app = express();
app.use(upload());
app.use(express.static('images'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 1) Global Middlewares
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Development looging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body 
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) Routes
app.use('/api/v1/users', userRouter);
app.use('/', userRouter);

// Error handling
app.use((err, req, res, next) => {
    let error = { ...err }
    if (error.code === 11000) {
        err.message = "Email already exists";
        err.statusCode = 401;
    }
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'errors';
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    })
});

// 4) Start Server
module.exports = app;