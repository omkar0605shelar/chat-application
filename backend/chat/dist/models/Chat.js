import mongoose, { Document, Schema } from 'mongoose';
const schema = new Schema({
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
});
export const Chat = mongoose.model("Chat", schema);
//# sourceMappingURL=Chat.js.map