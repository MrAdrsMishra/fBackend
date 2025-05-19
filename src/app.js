import express from 'express';
import cookieParser from 'cookie-parser';
<<<<<<< Updated upstream
import cors from "cors"
import dotenv from 'dotenv'
dotenv.config({  
   path:"./.env"
})
import path from 'path'
import { fileURLToPath } from 'url'
=======
import cors from "cors";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({
  path: "./.env",
});
>>>>>>> Stashed changes

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
<<<<<<< Updated upstream
   origin:process.env.CORS_ORIGIN,
   credentials:true
}))
// for limit of data transfer
app.use(express.json({
   limit:"16kb"
}))
// for reading data on encoded url of text
app.use(express.urlencoded({
   extended:true,
   limit:"16kb"
}))
// for static assets usage
app.use("/accessstatic",express.static(path.join(__dirname,'public')))
// for cookies handling
app.use(cookieParser())
=======
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use("/accessstatic", express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
>>>>>>> Stashed changes

// Routes
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js';
import taskRouter from './routes/task.routes.js';

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/messages_route", messageRouter);

// Export the app for Vercel
export { app };
export default app; // <-- This line is crucial for Vercel to auto-deploy
