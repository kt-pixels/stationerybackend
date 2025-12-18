// ==========================
// server.js
// ==========================
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => console.log("Server running"));
  })
  .catch((err) => {
    console.error("DB connection failed", err);
  });

// mongodb+srv://shopadminkaushikji:UcfJl1bpiKyXHSN5@cluster0.rlqtn1v.mongodb.net/?appName=Cluster0
// username = shopadminkaushikji
// password = UcfJl1bpiKyXHSN5
