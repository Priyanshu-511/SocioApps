const mongoose = require('mongoose');
require("dotenv").config()

const url = process.env.MONGO_URI;

const connectDb = async () => {
    try {
        console.log('Attempting MongoDB connection to:', url);
        await mongoose.connect(url);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDb;