import mongoose from "mongoose";
const taskSchema = mongoose.Schema({
    taskTitle:{
        type:String,
        required:true
    },
   requirments: {
        type:String,
        required:true
    },
    budget:{
        typse:Number,
        required:true
    },
    category:{
        typse:String,
        enum:["ProofReading","Editing","Formating","transcription","Resume","Legal","Academic","Bussiness","Other"],
        required:true
    },
    deadline:{
        typse:Date,
        required:true
    },
    tags:{
        typse:[String],
        required:true
    },
    AttachMents:{
        typse:[String],
        required:true
    },
    description:{
        type:String,
        required:true
    }
},{timestamp:true});