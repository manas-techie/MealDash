// Start the server
const dotenv = require('dotenv');

// Load environment variables before importing modules that may read process.env
dotenv.config({ path: './src/config/config.env' });

// import app
const app = require('./app');
const connectDatabase = require('./db/db.config');

// set port
const PORT = process.env.PORT || 8000;


// Connect to the database
connectDatabase();

// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

