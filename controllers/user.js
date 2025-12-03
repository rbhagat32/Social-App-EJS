import moment from "moment";
import sharp from "sharp";
import { PostModel } from "../models/post.js";
import { UserModel } from "../models/user.js";

const feedPage = async (req, res) => {
  const { email } = req.user;
  try {
    const posts = await PostModel.find().sort({ date: -1 }).populate("user");

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).send("User not found!");

    res.render("feed", { user, posts, moment });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const getMyProfile = async (req, res) => {
  const { email } = req.user;
  try {
    const user = await UserModel.findOne({ email }).populate("posts");
    if (!user) return res.status(404).send("User not found!");

    const posts = await PostModel.find({ user: user._id }).sort({ date: -1 });

    res.render("profile", { user, posts, moment });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const getOtherUserProfile = async (req, res) => {
  const { id } = req.params;
  const { email } = req.user;

  try {
    const user = await UserModel.findOne({ _id: id });
    if (!user) return res.status(404).send("User not found!");

    const posts = await PostModel.find({ user: user._id }).sort({ date: -1 });

    const loggedInUser = await UserModel.findOne({ email });
    if (!loggedInUser) return res.status(404).send("User not found!");

    if (user.email === loggedInUser.email) res.redirect("/profile");
    else res.render("user-profile", { user, loggedInUser, posts, moment });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const deleteAccount = async (req, res) => {
  const { email } = req.user;

  try {
    const user = await UserModel.findOne({ email }).populate("likedPosts");
    if (!user) return res.status(404).send("User not found!");

    // remove the user from likes array of all posts he has liked
    for (let i = 0; i < user.likedPosts.length; i++) {
      const post = await PostModel.findOne({ _id: user.likedPosts[i]._id });
      const indexOfUserInLikesArray = post.likes.indexOf(user._id);
      if (indexOfUserInLikesArray !== -1) {
        post.likes.splice(indexOfUserInLikesArray, 1);
        await post.save();
      }
    }

    // remove all posts of the user
    await PostModel.deleteMany({ user: user._id });

    // delete the user
    await UserModel.findOneAndDelete({ email });

    res.cookie("token", "");
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

const changeProfilePicture = async (req, res) => {
  const { email } = req.user;

  let image = req.file
    ? await sharp(req.file.buffer).resize(200, 200).png().toBuffer()
    : Buffer.alloc(0);

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).send("User not found!");

    user.image = image;
    user.save();

    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const removeProfilePicture = async (req, res) => {
  const { email } = req.user;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).send("User not found!");

    user.image = Buffer.alloc(0);
    user.save();

    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export {
  changeProfilePicture,
  deleteAccount,
  feedPage,
  getMyProfile,
  getOtherUserProfile,
  removeProfilePicture,
};
