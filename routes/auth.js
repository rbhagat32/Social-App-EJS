import Router from "express";
import { multerUpload } from "../config/multer-config.js";
import {
  homePage,
  loginPage,
  loginUser,
  logoutUser,
  signupNewUser,
  signupPage,
} from "../controllers/auth.js";
import { isLoggedIn } from "../middlewares/auth.js";

const router = Router();

router.get("/", homePage);
router
  .get("/signup", signupPage)
  .post("/signup", multerUpload.single("image"), signupNewUser);
router.get("/login", loginPage).post("/login", loginUser);
router.get("/logout", isLoggedIn, logoutUser);

export { router as AuthRouter };
