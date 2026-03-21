// Start the server


// import app       
const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./db/db');


// Load environment variables from .env file
dotenv.config({ path: "./config/config.env" });

// set port
const PORT = process.env.PORT || 8000;


// Connect to the database
connectDatabase();

// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

