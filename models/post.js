import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: String,
    default: () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;

      return `${day}-${month}-${year} ${formattedHours}:${minutes} ${period}`;
    },
  },
  content: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  image: Buffer,
});

export default mongoose.model("post", postSchema);
