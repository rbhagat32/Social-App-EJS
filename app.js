import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sharp from "sharp";
import moment from "moment";

import mongoose from "./config/mongoose-connection.js";
import userModel from "./models/user.js";
import postModel from "./models/post.js";

import upload from "./config/multer-config.js";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 3000;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "RAGHAV_BHAGAT";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h";

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

const isLoggedIn = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.redirect("/");

  try {
    const userData = jwt.verify(token, JWT_SECRET_KEY);
    req.user = userData;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
      return res.redirect("/");
    } else {
      return res.status(500).send("Authentication error");
    }
  }
};

const isMyPost = async (req, res, next) => {
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

app.get("/", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.render("home");

  try {
    const { email } = jwt.verify(token, JWT_SECRET_KEY);
    const user = await userModel.findOne({ email });
    if (user) return res.redirect("/feed");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
    }
  }
  res.render("home");
});

app.get("/signup", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.render("signup");

  try {
    const { email } = jwt.verify(token, JWT_SECRET_KEY);
    const user = await userModel.findOne({ email });
    if (user) return res.redirect("/feed");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
    }
  }
  res.render("signup");
});

app.post("/signup", upload.single("image"), async (req, res) => {
  const { name, username, email, password } = req.body;
  let image = req.file
    ? await sharp(req.file.buffer).resize(200, 200).png().toBuffer()
    : Buffer.alloc(0);

  try {
    const existingEmail = await userModel.findOne({ email });
    if (existingEmail)
      return res.status(500).send("Email is already signuped!");

    const existingUsername = await userModel.findOne({ username });
    if (existingUsername)
      return res.status(500).send("Username is already taken!");

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) return res.status(500).send("Error hashing password");

      const newUser = await userModel.create({
        name,
        username,
        email,
        password: hash,
        image,
      });

      const token = jwt.sign(
        { email: newUser.email, userId: newUser._id },
        JWT_SECRET_KEY,
        {
          expiresIn: JWT_EXPIRY,
        }
      );
      res.cookie("token", token);
      res.redirect("/feed");
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.render("login");

  try {
    const { email } = jwt.verify(token, JWT_SECRET_KEY);
    const user = await userModel.findOne({ email });
    if (user) return res.redirect("/feed");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
    }
  }
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(500).send("User doesn't exist!");

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).send("Error comparing passwords");

      if (result) {
        const token = jwt.sign({ email, userId: user._id }, JWT_SECRET_KEY, {
          expiresIn: JWT_EXPIRY,
        });
        res.cookie("token", token);
        res.redirect("feed");
      } else {
        res.send("Incorrect password!");
      }
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.get("/feed", isLoggedIn, async (req, res) => {
  const { email } = req.user;
  try {
    const posts = await postModel.find().populate("user");

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).send("User not found!");

    res.render("feed", { user, posts, moment });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile", isLoggedIn, async (req, res) => {
  const { email } = req.user;
  try {
    const user = await userModel.findOne({ email }).populate("posts");
    if (!user) return res.status(404).send("User not found!");

    res.render("profile", { user, moment });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/profile", isLoggedIn, upload.single("image"), async (req, res) => {
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
});

app.post("/remove-profile-picture", isLoggedIn, async (req, res) => {
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
});

app.post("/post", isLoggedIn, upload.single("image"), async (req, res) => {
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
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const post = await postModel.findOne({ _id: id }).populate("user");

    const indexOfUserInLikesArray = post.likes.indexOf(userId);
    if (indexOfUserInLikesArray === -1) post.likes.push(userId);
    else {
      post.likes.splice(indexOfUserInLikesArray, 1);
    }

    await post.save();
    res.redirect("/feed");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/edit/:id", isLoggedIn, isMyPost, async (req, res) => {
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
});

app.post("/edit/:id", isLoggedIn, isMyPost, async (req, res) => {
  const { id } = req.params;
  let { content } = req.body;
  content = content.trim();
  if (content === "") return res.redirect("/profile");

  try {
    const post = await postModel.findOne({ _id: id });
    post.content = content;
    post.date = Date.now();
    post.editted = true;
    post.likes.splice(0, post.likes.length);
    await post.save();

    res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/delete/:id", isLoggedIn, isMyPost, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const user = await userModel.findOne({ _id: userId });
    const postIndexInUserKaPostsArray = user.posts.indexOf(id);
    user.posts.splice(postIndexInUserKaPostsArray, 1);
    user.save();

    const post = await postModel.findOneAndDelete({ _id: id });

    res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
