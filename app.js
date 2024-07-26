import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import mongoose from "./config/mongoose-connection.js";

import AuthRouter from "./routes/auth.js";
import UserRouter from "./routes/user.js";
import PostRouter from "./routes/post.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Routes
app.use("/", AuthRouter);
app.use("/", UserRouter);
app.use("/", PostRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
