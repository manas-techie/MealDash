// configure express and middleware
// importing packages
const express = require('express');
const errorMiddleware = require('./middleware/error.middleware');
const path = require('path');
const cors = require("cors");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// creating express app
const app = express();


// use middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, '../public'))); // serve static files from backend/public


// import routes
const authRoutes = require('./routes/auth.route');
const restaurantRoutes = require('./routes/restaurant.route');


// use routes
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);





// use error middleware (should be last middleware)
app.use(errorMiddleware);

// export express
module.exports = app;