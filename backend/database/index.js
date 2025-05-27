import mongoose from "mongoose"

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "ChatApp" });
    } catch (error) {
        console.log("MONGODB FAILED TO CONNECT :: ",error)
    }
}

export default connectDB