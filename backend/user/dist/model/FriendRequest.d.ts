import mongoose, { Document, Types } from "mongoose";
export interface IFriendRequest extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
}
export declare const FriendRequest: mongoose.Model<IFriendRequest, {}, {}, {}, mongoose.Document<unknown, {}, IFriendRequest, {}, mongoose.DefaultSchemaOptions> & IFriendRequest & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFriendRequest>;
//# sourceMappingURL=FriendRequest.d.ts.map