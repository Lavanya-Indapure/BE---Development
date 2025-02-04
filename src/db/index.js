import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

let isConnected = false;
const connectDB = async ()=>{
    if (isConnected) {
        console.log("🔄 Using existing MongoDB connection");
        return;
    }
    try{
        console.log("Connecting with DB..............")
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\nMONGODB connected !! HOST NAME : ${connectionInstance.connection.host}`);
    }catch(error){
        console.log('URL -> ',process.env.MONGODB_URL);
        
        console.error('ERROR CONNECTING MONGODB : ',error);
        process.exit(1);        
    }
}

export default connectDB;