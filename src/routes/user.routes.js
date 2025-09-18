import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  loginUser,
  logoutUser,
  refresheAccessToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router
  .route("/logout")
  .post(verifyJWT, logoutUser);
router
  .route("/refresh-token")
  .post(refresheAccessToken); //here we can use verifyjwt middleware but we have already used all the security checks in the controllers so we can neglect it.
router
  .route("/change-password")
  .post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser); 
router
  .route("/update-user-details")
  .patch(verifyJWT, updateAccountDetails);
router
  .route("/update-user-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/update-user-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
// New route for fetching user watch history
router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
