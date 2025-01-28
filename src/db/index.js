import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MONGODB connected !! HOST NAME : ${connectionInstance.connection.host}`);
    }catch(error){
        console.log('URL -> ',process.env.MONGODB_URL);
        
        console.error('ERROR CONNECTING MONGODB : ',error);
        process.exit(1);        
    }
}

export default connectDB;