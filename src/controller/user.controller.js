import mongoose, { isValidObjectId, Schema } from "mongoose";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import { asyncHandler } from "../utility/asynchHandler.js";
import { uploadOnCloudinary } from "../utility/cloudinary.js";
import fs from "fs";
import { log } from "console";
import { Conversation } from "../models/Conversation.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "somthing went wrong while generating the access and refresh token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // steps
  // get data
  // check data
  // if not already registered
  // create entry

  // get details from the API request
  const { fullName, email, password } = req.body;
  // check if any field is empty
  if (
    [fullName, email, password].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exist
  const existedUser = await User.findOne({
    $or: [{ fullName }, { email }],
  });
  // alredy registered the give error
  if (existedUser) {
    throw new ApiError(409, "User with provided credintial already exist!");
  }
  let UserId = 'user-' + Date.now(); // Generate a unique UserId
  // otherwise create entry in database
  const user = await User.create({
    UserId,
    fullName,
    email,
    password,
  });
  // check if cretaed sccessfully by search
  const createdUser = await User.findById(user._id);
  // if not created
  if (!createdUser) {
    throw new ApiError(
      500,
      createdUser,
      "somthing went wrong while registring the user"
    );
  }
  // if created successfully return some details
  return res
    .status(200)
    .json(new ApiResponse(201, createdUser, "user registered successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  // get data from login API request
  const { email, password } = req.body;
  // check if fullName or email one of them is present
  if (!email) {
    throw new ApiError(400, "email is required");
  }
  // check byv fullName or by email if user is registerd or not
  const user = await User.findOne({ email });

  // if not found means not registered
  if (!user) {
    throw new ApiError(404, "Specified user does not exist!!");
  }
  // if registered check if password feild is not empty
  if (!password) {
    throw new ApiError(409, "password is required");
  }
  // verify password if matches with existed one
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // now generate tokens for login session also store in db showing login
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // const loggeduser = await User.findById(user._id);
  // if (!loggeduser) {
  //   throw new ApiError(409, "somthing went wrong while logging user");
  // }
  // options for preventing change of tokens by frontend
  const options = {
    httpOnly: true,
    secure: true,
  };
  // return access and refresh token for localstorage and session for no need of login before session expires
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user, accessToken }, "user loggedIn Successfull")
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  // find user and remove the refreshToken denoting the login status
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  // options for preventing change of tokens by frontend
  const options = {
    httpOnly: true,
    secure: true,
  };
  // now clean the cookies for stored tokens so that session can be end and no subsequent requests can be made by these tokens
  return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(new ApiResponse(200, "user logged out successfully!!"));
});
const updateDetails = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    age,
    photo,
    gender,
    Bio,
    organization,
    skills,
    rating,
  } = req.body;
  let accessToken =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  // console.log(
  //   "backend response",
  //   fullName,
  //   email,
  //   phone,
  //   age,
  //   gender,
  //   Bio,
  //   organization,
  //   skills,
  //   rating,
  //   photo
  // );

  // Check if the user exists
  const currentUser = await User.findById(req.user?._id);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  // Handle photo upload if provided
  let photoUrl = currentUser.photo; // Keep the existing photo if no new photo is uploaded
  if (req.file) {
    // Upload the file to Cloudinary
    try {
      const result = await uploadOnCloudinary(req.file.path);
      photoUrl = result;
      console.log("Photo URL:", photoUrl);
      console.log("Photo uploaded to Cloudinary:");
      // Delete the temporary file after uploading to Cloudinary
      fs.unlinkSync(req.file.path);
    } catch (error) {
      throw new ApiError(500, "Failed to upload photo");
    }
  }

  // Update only the provided fields
  const updatedFields = {};
  if (fullName) updatedFields.fullName = fullName;
  if (email) updatedFields.email = email;
  if (phone) updatedFields.phone = phone;
  if (age) updatedFields.age = age;
  if (gender) updatedFields.gender = gender;
  if (Bio) updatedFields.Bio = Bio;
  if (organization) updatedFields.organization = organization;
  if (skills) updatedFields.skills = skills;
  if (rating) updatedFields.rating = rating;
  if (photoUrl) updatedFields.photo = photoUrl;

  // Update the user in the database
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updatedFields },
    { new: true } // Return the updated document and validate the fields
  );
  if (!user) {
    throw new ApiError(500, "Failed to update user details");
  }

  // Return the updated user details
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, accessToken },
        "User details updated successfully"
      )
    );
});
const createTask = asyncHandler(async (req, res) => {
  const {
    taskTitle,
    requirements,
    description,
    category,
    budget,
    deadline,
    createdBy,
    status,
    tags,
    attachments,
  } = req.body;
  const userId = req.user._id;

  const currentUser = await User.findById(userId);
  if (!currentUser) throw new ApiError(404, "User not found");

  let attachmentUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await uploadOnCloudinary(file.path);
        attachmentUrls.push(result); // use .url if result is a full object
        fs.unlinkSync(file.path);
      } catch (error) {
        throw new ApiError(500, "Failed to upload attachments");
      }
    }
  }
  let TaskId = `task-${Date.now()}`; // Generate a unique TaskId
  const task = await Task.create({
    TaskId,
    taskTitle,
    requirements,
    description,
    category,
    budget,
    deadline,
    tags,
    createdBy:  userId,
    status,
    attachments: attachmentUrls,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const BrowseOpenTasks = asyncHandler(async (req, res) => {
  console.log("BrowseOpenTasks called");
  // Check if the user is logged in 
  const { userId } = req.query;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid or missing userId"));
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const tasks = await Task.find({
      status: "open",
      createdBy: { $ne: userObjectId }, // Exclude tasks created by the logged-in user
    }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
  } catch (error) {
    // Handle errors properly, log them, and send an appropriate response
    console.error("Error fetching tasks:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to fetch tasks: " + error.message)); //Include the error message
  }
});
const createConversation = asyncHandler(async (req, res) => {
  const { participants } = req.body;

  // Check if the participants array is provided and has at least two users
  if (!participants || participants.length < 2) {
    return res
    .status(400)
    .json(
      new ApiResponse(400, null, "At least two participants are required")
    );
  }
// check if already exist
  const existingConversation = await Conversation.findOne({
    participants: { $all: participants },
  });
  if (existingConversation) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, existingConversation, "Conversation already exists")
      );
  }
  // Create a new conversation
  const conversation = await Conversation.create({ participants });

  return res
  .status(201)
  .json(
    new ApiResponse(201, conversation, "Conversation created successfully"));
});
const getAllConversations = asyncHandler(async (req, res) => {
 const userId = req.params.userId;

  // Validate userId as ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid user ID format"));
  }
// Fetch all conversations for the user
  const conversations = await Conversation.find({
    participants: { $in: [userId] },
  });
  
// Check if conversations exist
  if (!conversations || conversations.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No conversations found"));
  }
  // Extract conversation Ids from conversations
  const conversationIds = [];
   conversations.forEach((conversation) => {
    conversationIds.push(conversation._id);
    });
  return res.status(200).json(
    new ApiResponse(
      200,
    conversationIds,
      "conversation Ids  fetched successfully"
    )
  );
});
export {
  registerUser,
  loginUser,
  logoutUser,
  updateDetails,
  createTask,
  BrowseOpenTasks,
  createConversation,
  getAllConversations
};
