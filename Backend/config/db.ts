import mongoose from "mongoose";

const connectToDb = async () => {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        console.warn("MONGODB_URI not found in env. Database features will be simulated.");
        return;
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB established successfully.");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

export default connectToDb;
