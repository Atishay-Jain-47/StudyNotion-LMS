const mongoose = require('mongoose');
require('dotenv').config();

const connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,

    })
    .then(() => console.log('Database connection successful'))
    .catch((err) => {
        console.log("Error in Database connection");
        console.log(err);
        process.exit(1);
    });
}

module.exports = {connect};