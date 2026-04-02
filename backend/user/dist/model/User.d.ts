import mongoose, { Document, Types } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    friends: Types.ObjectId[];
    avatar?: {
        url: string;
        publicId: string;
    };
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=User.d.ts.map