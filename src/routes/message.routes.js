import { Router } from "express";
import verifyJwt from "../middleware/auth.middleware.js";
import {
  createConversation,
  loadAllConversations,
  loadMessages,
  loadOpponentUserDetails,
  sendMessage,
} from "../controller/message.controller.js";

const messageRouter = Router();
messageRouter.route("/create-conversation").post( createConversation);
messageRouter
  .route("/get-all-conversations")
  .get(verifyJwt, loadAllConversations);
messageRouter.route("/get-messages").get(verifyJwt, loadMessages);
messageRouter
  .route("/get-other-user-details")
  .post(verifyJwt, loadOpponentUserDetails);
messageRouter.route("/send-message").post(verifyJwt, sendMessage);
export default messageRouter;
