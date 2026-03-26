const dotenv = require('dotenv');
dotenv.config({ path: './src/config/config.env' });

const app = require('./app');
const connectDatabase = require('./db/db.config');

const PORT = process.env.PORT || 3000;


// Connect to the database
connectDatabase()
    .then(() => {
        // start server
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        server.on('error', (err) => {
            console.error('SERVER ERROR: ', err);
            process.exit(1);
        });
    })
    .catch((err) => {
        console.error('MONGODB FAILED TO CONNECT: ', err);
        process.exit(1);
    })


