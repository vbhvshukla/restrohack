import { app } from "./app.js";
import connectDb from "./config/db.config.js";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });

connectDb().then(() => {
    app.listen(process.env.PORT || 8006, () => {
        console.log(`Server running at port :: ${process.env.PORT}`);
    })
})
    .catch((err) => {
        console.log("DB Connection Error :: ", err);
        process.exit(1);
    });