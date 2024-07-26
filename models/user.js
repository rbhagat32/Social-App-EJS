import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: String,

  username: String,

  email: String,

  password: String,

  image: Buffer,

  isAdmin: {
    type: Boolean,
    default: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],

  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

export default mongoose.model("user", userSchema);
