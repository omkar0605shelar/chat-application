import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDb = async () => {
  const url = process.env.MONGO_URI;

  // if(!url){
  //   throw new Error("MONGO_URI is not defined in environment variables");
  // }
  try{
    await mongoose.connect(url as string, {
      dbName: "ChatappMicroservice",
    });
    console.log("Database connected successfully");
  }
  catch(err){
    console.log("Database connection error", err)
    process.exit(1);
  }
}