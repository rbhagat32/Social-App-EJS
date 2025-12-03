import Router from "express";
import { multerUpload } from "../config/multer-config.js";
import {
  changeProfilePicture,
  deleteAccount,
  feedPage,
  getMyProfile,
  getOtherUserProfile,
  removeProfilePicture,
} from "../controllers/user.js";
import { isLoggedIn } from "../middlewares/auth.js";

const router = Router();

router.get("/feed", isLoggedIn, feedPage);
router
  .get("/profile", isLoggedIn, getMyProfile)
  .post(
    "/profile",
    isLoggedIn,
    multerUpload.single("image"),
    changeProfilePicture
  );
router.get("/user-profile/:id", isLoggedIn, getOtherUserProfile);
router.get("/delete-account", isLoggedIn, deleteAccount);
router.post("/remove-profile-picture", isLoggedIn, removeProfilePicture);

export { router as UserRouter };
