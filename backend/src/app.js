// configure express and middleware
// importing packages
const express = require('express');
const path = require('path');


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


// routes
app.get('/', (req, res) => {
    res.send('Hello World!');
})





// export express
module.exports = app;