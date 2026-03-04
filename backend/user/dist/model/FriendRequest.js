import mongoose, { Document, Schema, Types } from "mongoose";
const schema = new Schema({
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
export const FriendRequest = mongoose.model("FriendRequest", schema);
//# sourceMappingURL=FriendRequest.js.map