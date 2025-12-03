import Router from "express";
import { multerUpload } from "../config/multer-config.js";
import {
  createPost,
  deletePost,
  editPage,
  editPost,
  likePost,
} from "../controllers/post.js";
import { isLoggedIn } from "../middlewares/auth.js";
import { isMyPost } from "../middlewares/post.js";

const router = Router();

router.post("/post", isLoggedIn, multerUpload.single("image"), createPost);
router.get("/like/:id", isLoggedIn, likePost);
router
  .get("/edit/:id", isLoggedIn, isMyPost, editPage)
  .post("/edit/:id", isLoggedIn, isMyPost, editPost);
router.get("/delete/:id", isLoggedIn, isMyPost, deletePost);

export { router as PostRouter };
