const mongoose = require("mongoose");

const connectDB = async () => {
    let retries = 5;

    while (retries > 0) {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("MongoDB Connected");
            break;
        } catch (err) {
            retries--;
            console.log(`MongoDB connection failed. Retries left: ${retries}`);
            console.log(err.message);

            if (retries === 0) {
                console.log("Could not connect to MongoDB. Exiting.");
                process.exit(1);
            }

            // Wait 3 seconds before retrying
            await new Promise(res => setTimeout(res, 3000));
        }
    }

    mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected.");
    });
};

module.exports = connectDB;
