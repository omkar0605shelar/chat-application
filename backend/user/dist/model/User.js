import mongoose, { Document, Schema, Types } from "mongoose";
const schema = new Schema({
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
        }]
}, {
    timestamps: true
});
export const User = mongoose.model("User", schema);
//# sourceMappingURL=User.js.map