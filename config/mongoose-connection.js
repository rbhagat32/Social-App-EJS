import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose
  // .connect(`${process.env.MONGODB_URI}`)
  .connect("mongodb://127.0.0.1:27017/mini-project")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error.message);
  });

export default mongoose.connection;
