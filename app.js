import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "./models/user.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

const isLoggedIn = (req, res, next) => {
  if (req.cookies.token === "") res.redirect("/");
  else {
    const token = req.cookies.token;
    let userData = jwt.verify(token, "SECRET_KEY");
    req.user = userData;
    next();
  }
};

app.get("/", async (req, res) => {
  const token = req.cookies.token;

  if (token === "") res.render("home");
  else {
    let { email } = jwt.verify(token, "SECRET_KEY");
    const user = await userModel.findOne({ email });
    if (user) res.redirect("/profile");
    else res.render("home");
  }
});

app.get("/login", async (req, res) => {
  const token = req.cookies.token;

  if (token === "") res.render("login");
  else {
    let { email } = jwt.verify(token, "SECRET_KEY");
    const user = await userModel.findOne({ email });
    if (user) res.redirect("/profile");
    else res.render("login");
  }
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("User doesn't exist !");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userId: user._id }, "SECRET_KEY");
      res.cookie("token", token);
      res.redirect("profile");
    } else res.send("Incorrect password !");
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.get("/register", async (req, res) => {
  const token = req.cookies.token;

  if (token === "") res.render("register");
  else {
    let { email } = jwt.verify(token, "SECRET_KEY");
    const user = await userModel.findOne({ email });
    if (user) res.redirect("/profile");
    else res.render("register");
  }
});

app.post("/register", async (req, res) => {
  let { name, username, email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("Email is already registered !");

  bcrypt.hash(password, 10, async (err, hash) => {
    let user = await userModel.create({
      name,
      username,
      email,
      password: hash,
    });

    let token = jwt.sign({ email: email, userId: user._id }, "SECRET_KEY");
    res.cookie("token", token);
    res.redirect("/profile");
  });
});

app.get("/profile", isLoggedIn, async (req, res) => {
  let { email } = req.user;
  let user = await userModel.findOne({ email });

  res.render("profile", { user });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
