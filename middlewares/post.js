import userModel from "../models/user.js";
import postModel from "../models/post.js";

export const isMyPost = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const user = await userModel.findOne({ _id: userId });
    if (user.isAdmin) {
      next();
      return;
    }

    const post = await postModel.findOne({ _id: id });
    if (post.user.toString() === userId) {
      next();
    } else {
      res.status(401).send("You are not authorized to edit this post!");
    }
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
