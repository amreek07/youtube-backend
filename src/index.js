// require('dotenv').config(); // we can load environment variables throw this syntax also
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "./db/db.js";

connectDB();
