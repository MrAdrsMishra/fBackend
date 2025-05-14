import { Router } from "express";
import verifyJwt from "../middleware/auth.middleware.js";
import { loadAllConversations, loadMessages, loadOpponentUserDetails,sendMessage } from "../controller/message.controller.js";

const messageRouter = Router();
messageRouter.route("/get-all-conversations").get(verifyJwt,loadAllConversations);
messageRouter.route("/get-messages").get(verifyJwt,loadMessages);
messageRouter.route("/get-other-user-details").post(verifyJwt,loadOpponentUserDetails);
messageRouter.route("/send-message").post(verifyJwt,sendMessage);
export default messageRouter;