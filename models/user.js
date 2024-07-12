import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/mini-project");

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  image: String,
});

export default mongoose.model("user", userSchema);
