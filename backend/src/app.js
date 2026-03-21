// configure express and middleware
// importing packages
const express = require('express');
const path = require('path');
const errorMiddleware = require('./middleware/error.middleware');



// creating express app
const app = express();

//config middleware
const cors = require("cors");
const bodyParser = require('body-parser');

// use middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files from backend/public
app.use('/public', express.static(path.join(__dirname, '../public')));


// import routes
const authRoutes = require('./routes/auth.route');



// use routes
app.use('/api/v1/users', authRoutes);





// use error middleware (should be last middleware)
app.use(errorMiddleware);

// export express
module.exports = app;