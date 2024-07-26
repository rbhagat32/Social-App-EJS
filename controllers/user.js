import userModel from "../models/user.js";
import postModel from "../models/post.js";
import sharp from "sharp";
import moment from "moment";

export const feedPage = async (req, res) => {
  const { email } = req.user;
  try {
    const posts = await postModel.find().sort({ date: -1 }).populate("user");

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).send("User not found!");

    res.render("feed", { user, posts, moment });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const getMyProfile = async (req, res) => {
  const { email } = req.user;
  try {
    const user = await userModel.findOne({ email }).populate("posts");
    if (!user) return res.status(404).send("User not found!");

    const posts = await postModel.find({ user: user._id }).sort({ date: -1 });

    res.render("profile", { user, posts, moment });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const getOtherUserProfile = async (req, res) => {
  const { id } = req.params;
  const { email } = req.user;

  try {
    const user = await userModel.findOne({ _id: id });
    if (!user) return res.status(404).send("User not found!");

    const posts = await postModel.find({ user: user._id }).sort({ date: -1 });

    const loggedInUser = await userModel.findOne({ email });
    if (!loggedInUser) return res.status(404).send("User not found!");

    if (user.email === loggedInUser.email) res.redirect("/profile");
    else res.render("user-profile", { user, loggedInUser, posts, moment });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const deleteAccount = async (req, res) => {
  const { email } = req.user;

  try {
    const user = await userModel.findOne({ email }).populate("likedPosts");
    if (!user) return res.status(404).send("User not found!");

    // remove the user from likes array of all posts he has liked
    for (let i = 0; i < user.likedPosts.length; i++) {
      const post = await postModel.findOne({ _id: user.likedPosts[i]._id });
      const indexOfUserInLikesArray = post.likes.indexOf(user._id);
      if (indexOfUserInLikesArray !== -1) {
        post.likes.splice(indexOfUserInLikesArray, 1);
        await post.save();
      }
    }

    // remove all posts of the user
    await postModel.deleteMany({ user: user._id });

    // delete the user
    await userModel.findOneAndDelete({ email });

    res.cookie("token", "");
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

export const changeProfilePicture = async (req, res) => {
  const { email } = req.user;

  let image = req.file
    ? await sharp(req.file.buffer).resize(200, 200).png().toBuffer()
    : Buffer.alloc(0);

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).send("User not found!");

    user.image = image;
    user.save();

    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const removeProfilePicture = async (req, res) => {
  const { email } = req.user;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).send("User not found!");

    user.image = Buffer.alloc(0);
    user.save();

    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
