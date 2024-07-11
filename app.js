import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModel from "./models/user.js";

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "RAGHAV_BHAGAT";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1m";

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
dotenv.config();

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

app.get("/", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.render("home");

  try {
    const { email } = jwt.verify(token, JWT_SECRET_KEY);
    const user = await userModel.findOne({ email });
    if (user) return res.redirect("/profile");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
    }
  }
  res.render("home");
});

app.get("/login", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.render("login");

  try {
    const { email } = jwt.verify(token, JWT_SECRET_KEY);
    const user = await userModel.findOne({ email });
    if (user) return res.redirect("/profile");
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
        res.redirect("profile");
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

app.get("/register", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.render("register");

  try {
    const { email } = jwt.verify(token, JWT_SECRET_KEY);
    const user = await userModel.findOne({ email });
    if (user) return res.redirect("/profile");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
    }
  }
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(500).send("Email is already registered!");

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) return res.status(500).send("Error hashing password");

      const newUser = await userModel.create({
        name,
        username,
        email,
        password: hash,
      });

      const token = jwt.sign(
        { email: newUser.email, userId: newUser._id },
        JWT_SECRET_KEY,
        {
          expiresIn: JWT_EXPIRY,
        }
      );
      res.cookie("token", token);
      res.redirect("/profile");
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile", isLoggedIn, async (req, res) => {
  const { email } = req.user;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).send("User not found");
    res.render("profile", { user });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
