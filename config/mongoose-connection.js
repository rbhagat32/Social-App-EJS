import mongoose from "mongoose";

mongoose
  .connect("mongodb://127.0.0.1:27017/mini-project")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error.message);
  });

export default mongoose.connection;
