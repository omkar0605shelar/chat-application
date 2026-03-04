import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFriendRequest extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
}

const schema: Schema<IFriendRequest> = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, {
    timestamps: true
});

schema.index({ sender: 1, receiver: 1 });

export const FriendRequest = mongoose.model<IFriendRequest>("FriendRequest", schema);
