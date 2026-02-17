import mongoose, { Document, Schema } from "mongoose";

export interface IUSer extends Document {
  name: string;
  email: string;
}

const schema: Schema<IUSer> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String, 
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUSer>("User", schema);
