import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import { UserModel } from "../models/user.js";

const homePage = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.render("home");

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findOne({ email });
    if (user) return res.redirect("/feed");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
    }
  }
  res.render("home");
};

const signupPage = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.render("signup");

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findOne({ email });
    if (user) return res.redirect("/feed");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
    }
  }
  res.render("signup");
};

const signupNewUser = async (req, res) => {
  const { name, username, email, password } = req.body;
  let image = req.file
    ? await sharp(req.file.buffer).resize(200, 200).png().toBuffer()
    : Buffer.alloc(0);

  try {
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail)
      return res.status(500).send("Email is already signuped!");

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername)
      return res.status(500).send("Username is already taken!");

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) return res.status(500).send("Error hashing password");

      const newUser = await UserModel.create({
        name,
        username,
        email,
        password: hash,
        image,
      });

      const token = jwt.sign(
        { email: newUser.email, userId: newUser._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: process.env.JWT_EXPIRY,
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // expires after 1 week
      });

      res.redirect("/feed");
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const loginPage = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.render("login");

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findOne({ email });
    if (user) return res.redirect("/feed");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
    }
  }
  res.render("login");
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(500).send("User doesn't exist!");

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).send("Error comparing passwords");

      if (result) {
        const token = jwt.sign(
          { email, userId: user._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: process.env.JWT_EXPIRY,
          }
        );
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "strict",
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // expires after 1 week
        });
        res.redirect("feed");
      } else {
        res.send("Incorrect password!");
      }
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const logoutUser = (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
};

export {
  homePage,
  loginPage,
  loginUser,
  logoutUser,
  signupNewUser,
  signupPage,
};
