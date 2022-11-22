import mongoose from 'mongoose';
import { IUser } from "./userTypes";

const userSchema = new mongoose.Schema<IUser>({
        username: { type: String, required: true, minLength: 4, maxLength: 20, unique: true },
        password: { type: String, required: true, minLength: 8, maxLength: 255 },
    },
    { timestamps: true }
)

const UserModel = mongoose.model<IUser>('User', userSchema)

export default UserModel