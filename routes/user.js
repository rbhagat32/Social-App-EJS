import Router from "express";
const router = Router();
import {
  changeProfilePicture,
  deleteAccount,
  feedPage,
  getMyProfile,
  getOtherUserProfile,
  removeProfilePicture,
} from "../controllers/user.js";
import { isLoggedIn } from "../middlewares/auth.js";
import upload from "../config/multer-config.js";

// Feed
router.get("/feed", isLoggedIn, feedPage);

// My Profile
router
  .get("/profile", isLoggedIn, getMyProfile)
  .post("/profile", isLoggedIn, upload.single("image"), changeProfilePicture);

// Other User's Profile
router.get("/user-profile/:id", isLoggedIn, getOtherUserProfile);

// Delete Account
router.get("/delete-account", isLoggedIn, deleteAccount);

// Remove Profile Picture
router.post("/remove-profile-picture", isLoggedIn, removeProfilePicture);

export default router;
