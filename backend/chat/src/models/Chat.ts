import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  users: string[],
  isGroup: boolean,
  latestMessage: {
    text: string,
    sender: string,
  },
  createdAt: Date,
  updatedAt: Date
}

const schema: Schema<IChat> = new Schema({
  users: [{
    type: String,
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  latestMessage: {
    text: String,
    sender: String
  }
}, {
  timestamps: true
})

export const Chat = mongoose.model<IChat>("Chat", schema);