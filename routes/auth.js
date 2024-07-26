import Router from "express";
const router = Router();

import {
  homePage,
  signupPage,
  signupNewUser,
  loginPage,
  loginUser,
  logoutUser,
} from "../controllers/auth.js";
import { isLoggedIn } from "../middlewares/auth.js";
import upload from "../config/multer-config.js";

// Homepage
router.get("/", homePage);

// Signup
router
  .get("/signup", signupPage)
  .post("/signup", upload.single("image"), signupNewUser);

// Login
router.get("/login", loginPage).post("/login", loginUser);

// Logout
router.get("/logout", isLoggedIn, logoutUser);

export default router;
