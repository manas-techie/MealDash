const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: "./config/config.env" });

// Connect to MongoDB
const connectDatabase = () => {
    mongoose.connect(process.env.MONGO_URI)
        .then((con) => console.log('MongoDB connected successfully with host:', con.connection.host))
        .catch(err => console.error('MongoDB connection error:', err));
};

module.exports = connectDatabase;