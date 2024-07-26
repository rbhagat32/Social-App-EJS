import userModel from "../models/user.js";
import postModel from "../models/post.js";
import sharp from "sharp";

export const createPost = async (req, res) => {
  const { email } = req.user;

  let { content } = req.body;
  content = content.trim();

  let image = req.file
    ? await sharp(req.file.buffer).resize(600, 600).png().toBuffer()
    : Buffer.alloc(0);

  if (content === "" && image.toString("base64") === "")
    return res.redirect("/feed");

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).redirect("/");
    let post = await postModel.create({
      user: user._id,
      content,
      image,
    });

    user.posts.push(post._id);
    await user.save();

    res.redirect("/feed");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const post = await postModel.findOne({ _id: id }).populate("user");
    const loggedInUser = await userModel.findOne({ _id: userId });

    // add post to user's likedPosts array
    const indexOfPostInLikedPostsArray = loggedInUser.likedPosts.indexOf(id);
    if (indexOfPostInLikedPostsArray === -1) loggedInUser.likedPosts.push(id);
    else {
      loggedInUser.likedPosts.splice(indexOfPostInLikedPostsArray, 1);
    }
    await loggedInUser.save();

    // add user to post's likes array
    const indexOfUserInLikesArray = post.likes.indexOf(userId);
    if (indexOfUserInLikesArray === -1) post.likes.push(userId);
    else {
      post.likes.splice(indexOfUserInLikesArray, 1);
    }
    await post.save();

    res.redirect(req.get("Referer"));
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const editPage = async (req, res) => {
  const { id } = req.params;
  const { email } = req.user;
  try {
    const post = await postModel.findOne({ _id: id });
    const user = await userModel.findOne({ email }).populate("posts");
    if (!user) return res.status(404).send("User not found!");

    res.render("edit", { user, post });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const editPost = async (req, res) => {
  const { id } = req.params;
  let { content } = req.body;
  content = content.trim();
  if (content === "") return res.redirect("/profile");

  try {
    const user = await userModel.findOne({ email: req.user.email });
    const post = await postModel.findOne({ _id: id });

    post.content = content;
    post.date = Date.now();
    post.editted = true;

    // remove all likes from the post if it is editted
    post.likes.splice(0, post.likes.length);

    // remove the post from all users likedPosts array
    const users = await userModel.find();
    for (let i = 0; i < users.length; i++) {
      const indexOfPostInLikedPostsArray = users[i].likedPosts.indexOf(id);
      if (indexOfPostInLikedPostsArray !== -1) {
        users[i].likedPosts.splice(indexOfPostInLikedPostsArray, 1);
        await users[i].save();
      }
    }

    await post.save();

    if (user.isAdmin) return res.redirect("/feed");
    else return res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  const { email } = req.user;

  try {
    // finding post
    const post = await postModel.findOne({ _id: id });

    // finding the owner of that post and removing the post from his posts array
    const userId = post.user.toString();
    const user = await userModel.findOne({ _id: userId });
    const postIndex = user.posts.indexOf(id);
    user.posts.splice(postIndex, 1);
    user.save();

    // finding all users who have liked that post and removing the post from their likedPosts array
    const users = await userModel.find();
    for (let i = 0; i < users.length; i++) {
      const indexOfPostInLikedPostsArray = users[i].likedPosts.indexOf(id);
      if (indexOfPostInLikedPostsArray !== -1) {
        users[i].likedPosts.splice(indexOfPostInLikedPostsArray, 1);
        await users[i].save();
      }
    }

    // deleting post
    await postModel.findOneAndDelete({ _id: id });

    // finding logged in user
    const loggedInUser = await userModel.findOne({ email });

    if (loggedInUser.isAdmin) return res.redirect("/feed");
    else return res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
