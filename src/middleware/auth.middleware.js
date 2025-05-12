import jwt from "jsonwebtoken";
import {asyncHandler} from '../utility/asynchHandler.js'
import { User } from "../models/user.model.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
  // Get the token from cookies or headers
  console.log("here in verifyJwt",req.body)
  const token =
    req.cookies?.token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, access denied" });
  }

  try {
    // Decode the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Check the role and find the user in the appropriate model
    let user = await User.findById(decodedToken._id);

    // Attach the user and role to the request object
    req.user = user;

    next();
  } catch (error) {
    return res
    .status(401)
    .json(
        { 
            message: "Invalid token, access denied" 
        }
    );
  }
});

export default verifyJwt;
