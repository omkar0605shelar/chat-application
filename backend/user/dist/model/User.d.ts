import mongoose, { Document } from "mongoose";
export interface IUSer extends Document {
    name: string;
    email: string;
}
export declare const User: mongoose.Model<IUSer, {}, {}, {}, mongoose.Document<unknown, {}, IUSer, {}, mongoose.DefaultSchemaOptions> & IUSer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUSer>;
//# sourceMappingURL=User.d.ts.map