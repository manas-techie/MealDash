const mongoose = require('mongoose');

// Connect to MongoDB
const connectDatabase = () => {
    if (!process.env.MONGO_URI) {
        console.error('MongoDB connection error: MONGO_URI is not set. Check src/config/config.env and dotenv path.');
        return;
    }

    mongoose.connect(process.env.MONGO_URI)
        .then((con) => console.log('MongoDB connected successfully with host:', con.connection.host))
        .catch(err => console.error('MongoDB connection error:', err));
};

module.exports = connectDatabase;