import Router from "express";
const router = Router();

import {
  createPost,
  deletePost,
  editPage,
  editPost,
  likePost,
} from "../controllers/post.js";
import { isLoggedIn } from "../middlewares/auth.js";
import { isMyPost } from "../middlewares/post.js";
import upload from "../config/multer-config.js";

// Create a new post
router.post("/post", isLoggedIn, upload.single("image"), createPost);

// Like a post
router.get("/like/:id", isLoggedIn, likePost);

// Edit a post
router
  .get("/edit/:id", isLoggedIn, isMyPost, editPage)
  .post("/edit/:id", isLoggedIn, isMyPost, editPost);

// Delete a post
router.get("/delete/:id", isLoggedIn, isMyPost, deletePost);

export default router;
