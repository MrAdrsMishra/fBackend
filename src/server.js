import dotenv from "dotenv"
import {connectDB} from './db/database.js'
import { app } from "./app.js"

dotenv.config({
    path:"./.env"
})
// connect database
connectDB().then(()=>{
    app.listen(process.env.PORT||5000,()=>{
        console.log(`server is running at: ${process.env.PORT}`)
    });
    app.get("/", (req, res) => {
        res.send("hey i'm listening u!");
    });
})
.catch((error)=>{
    console.error(`database connection failed error:${error}`);
    process.exit(0);
})