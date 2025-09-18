import { Router } from "express";
import { loginUser, logoutUser, refresheAccessToken, registerUser, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { 
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refresheAccessToken); //here we can use verifyjwt middleware but we have already used all the security checks in the controllers so we can neglect it.
router.route("/update-user-details").post(verifyJWT, updateAccountDetails);
router.route("/update-user-avatar").post(verifyJWT, upload.single("avatar") ,updateAvatar);
router.route("/update-user-cover-image").post(verifyJWT, upload.single("coverImage") ,updateCoverImage);


export default router;
