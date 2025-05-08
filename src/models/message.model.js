import { timeStamp } from "console";
import mongoose from "mongoose";
const messageSchema = mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    reciever:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },

},{timeStamp:true});
export const Message = mongoose.model("Message",messageSchema);