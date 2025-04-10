import mongoose from "mongoose";

const connectDB = async function () {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n Database connection successful at Host :: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log(`Database connection unsuccessful :: `, error);
        process.exit(1);
    }
}

export default connectDB;