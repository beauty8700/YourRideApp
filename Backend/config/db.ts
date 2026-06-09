import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import driverModel from "../models/driver.model.js";
import rideModel from "../models/ride.model.js";

const dropLegacyIndexIfExists = async (collectionName: string, indexName: string) => {
    const db = mongoose.connection.db;

    if (!db) {
        return;
    }

    try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        const indexExists = indexes.some((index) => index.name === indexName);

        if (indexExists) {
            await collection.dropIndex(indexName);
            console.log(`Dropped legacy index ${indexName} on ${collectionName}`);
        }
    } catch (err: any) {
        if (err?.code === 26) {
            return;
        }
        throw err;
    }
};

const syncModelIndexes = async () => {
    await dropLegacyIndexIfExists("users", "username_1");
    await dropLegacyIndexIfExists("drivers", "username_1");
    await Promise.all([
        userModel.syncIndexes(),
        driverModel.syncIndexes(),
        rideModel.syncIndexes(),
    ]);
    console.log("Mongoose indexes synchronized successfully.");
};

const connectToDb = async () => {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        console.warn("MONGODB_URI not found in env. Database features will be simulated.");
        return;
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB established successfully.");
        await syncModelIndexes();
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

export default connectToDb;
