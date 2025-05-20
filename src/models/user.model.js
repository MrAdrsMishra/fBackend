import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      match: /^\+91\d{10}$/,
      default:"+917697309688"
    },
    organization: {
      type: String,
      default:"IES college"
    },
    photo: {
      type: String,
    },
    age: {
      type: Number,
      default: 18,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default:"Male"
    },
    Bio:{
      type: String,
      default: "this is adarsh mishra from ies college of technology and working as a software developer and aspiring to get a peacefull and reputed job on a growth oriented environment",
    },
    rating:{
      type: String,
      default: 4.5
    },
    skills:{
      type: String,
      default: "programming editing MSoffice content_writer tech-geek",
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // if not modified
  if (!this.isModified("password")) return next();

  // if ask to modified
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (requestPassword) {
   return await bcrypt.compare(requestPassword, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
