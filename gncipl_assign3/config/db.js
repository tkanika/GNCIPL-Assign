const mongoose = require('mongoose');

//Function to connect to the MongoDb Database
const connectDB = async () => {
    mongoose.connection.on('connected',()=>console.log('Database connected'));
    await mongoose.connect(`${process.env.MONGODB_URI}/BudgetTracker`);
}

module.exports = connectDB;