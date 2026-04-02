import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  friends: Types.ObjectId[];
  avatar?: {
    url: string;
    publicId: string;
  };
}

const schema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  avatar: {
    url: String,
    publicId: String
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>("User", schema);
