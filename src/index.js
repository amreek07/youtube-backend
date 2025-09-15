// require('dotenv').config(); // we can load environment variables throw this syntax also
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "./db/db.js";
import { app } from "./app.js";

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000, ()=> {
    console.log(`Server is running at port ${process.env.PORT || 8000}`);
  })
})
.catch((err)=>{
  console.log("Error in connecting to database", err);
  process.exit(1);
})
