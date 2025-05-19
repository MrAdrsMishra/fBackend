import dotenv from "dotenv";
import { connectDB } from './db/database.js';
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
    // Connect DB and run server locally
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running locally at http://localhost:${PORT}`);
        });

        app.get("/", (req, res) => {
            res.send("Hey, I'm listening to you locally!");
        });

        app.get("/hello", (req, res) => {
            res.send("Hello, I'm listening to you locally!");
        });
    }).catch((error) => {
        console.error(`Database connection failed: ${error}`);
        process.exit(1);
    });
}
