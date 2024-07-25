import mongoose from "mongoose";

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

  image: Buffer,

  isAdmin: {
    type: Boolean,
    default: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("user", userSchema);
