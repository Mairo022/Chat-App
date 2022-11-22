import mongoose from "mongoose";
import { IMessageModel } from "./chatTypes";

const messageSchema = new mongoose.Schema<IMessageModel>({
        message: { type: String, required: true },
        sender: { type: String, required: true, ref: "User" },
        room: { type: String, required: true, ref: "Room" },
    },
    { timestamps: true }
)

const ChatMessageModel = mongoose.model<IMessageModel>("Message", messageSchema)

export default ChatMessageModel