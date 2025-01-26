require('dotenv').config()
const express = require('express');
const app = express();
const port = 5000;


app.get('/',(req,res)=>{
    res.send('Hello World!')
})

app.listen(process.env.PORT,()=>{
    console.log(`your app is running on PORT ${port}`);  
})