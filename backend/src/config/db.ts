import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("✅ Database Connection Established");
    } catch (error) {
        console.error("❌ Connection Issues with Database:", error);
        process.exit(1);
    }
};
