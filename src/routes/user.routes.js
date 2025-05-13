import { Router } from "express";
import verifyJwt from "../middleware/auth.middleware.js";
import { BrowseOpenTasks, createConversation, createTask, getAllConversations, loginUser, logoutUser, registerUser,updateDetails } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { get } from "mongoose";

const userRouter = Router();

userRouter.route("/register").post(registerUser)// done
userRouter.route("/login").post(loginUser)// done
userRouter.route("/logout").post(verifyJwt,logoutUser)// done
userRouter.route("/update_details").post(verifyJwt,upload.single("photo"),updateDetails)// done
userRouter.route("/create-task").post(
    verifyJwt,
    upload.array("attachments"),
    createTask
);
userRouter.route("/browse-task").get(BrowseOpenTasks);
userRouter.route("/create-conversation").post(verifyJwt,createConversation);
userRouter.route("/get-all-coversations").get(verifyJwt,getAllConversations);
export default userRouter;
