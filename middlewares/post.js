import { PostModel } from "../models/post.js";
import { UserModel } from "../models/user.js";

const isMyPost = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const user = await UserModel.findOne({ _id: userId });
    if (user.isAdmin) {
      next();
      return;
    }

    const post = await PostModel.findOne({ _id: id });
    if (post.user.toString() === userId) {
      next();
    } else {
      res.status(401).send("You are not authorized to edit this post!");
    }
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export { isMyPost };
