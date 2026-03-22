const mongoose = require('mongoose');
const { DB_NAME } = require('../constant');

// Connect to MongoDB
const connectDatabase = async () => {

    await mongoose.connect(`${process.env.MONGO_URI}${DB_NAME}`)
    .then((con) => console.log('MONGODB CONNECTED SUCCESSFULLY WITH HOST: ', con.connection.host))
        .catch(err => console.error('MONGODB CONNECTION ERROR: ', err));
};

module.exports = connectDatabase;