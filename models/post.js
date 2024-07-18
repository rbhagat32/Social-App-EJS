import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    default: "",
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  image: Buffer,
  editted: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("post", postSchema);
