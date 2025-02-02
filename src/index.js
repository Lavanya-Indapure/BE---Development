
// require('dotenv').config({path : './env' })
import dotenv from "dotenv"
dotenv.config({
    path : './.env'
})
import connectDB from "./db/index.js"
import { app } from "./app.js"


/*const app = express()
(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("err",(error)=>{
            console.log("ERR : ",error);
        })

        app.listen( process.env.PORT ,()=>{
            console.log(`your app is running on http://localhost:${process.env.PORT}/`);
            
        })
        
    } catch(error){
        console.error("ERROR : ",error);
        throw error
        
    }
})()*/

const port = process.env.PORT || 3000
connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`your app is running on http://localhost:${port}/`);
    })
})
.catch((err)=>{
    console.error('Error connecting Mongo DB : ',err);  
})



app.get('/jokes',(req,res)=>{
    res.send('JOKES')
})  