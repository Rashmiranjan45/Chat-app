import mongoose from "mongoose"

const connectDB = async(uri) => {
    try {
        mongoose.connect(uri,{dbName:"ChatApp"})
    } catch (error) {
        console.log("MONGODB FAILED TO CONNECT :: ",error)
    }
}

export default connectDB