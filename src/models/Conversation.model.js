import mongoose from "mongoose";
const conversationSchema = mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
export const Conversation = mongoose.model("Conversation", conversationSchema);
