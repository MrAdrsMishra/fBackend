import mongoose from "mongoose";

export const connectDB = async() => {
  try {
    const connectionInstance =await mongoose.connect(
      `${process.env.MONGODB_URL}/${process.env.DATABASE_NAME}`
    );
    console.log(
      `Database connected successfully${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("error found in databse connection",error)
    process.exit(1);
  }
};
