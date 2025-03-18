import mongoose from "mongoose";

export const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log(`Connected with database ${mongoose.connection.host}.`)
    } catch(error) {
        console.log("MONGODB CONNECTION ERROR",error)
        process.exit(1)
    }
}