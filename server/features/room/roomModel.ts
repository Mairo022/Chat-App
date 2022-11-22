import mongoose from "mongoose";
import { IRoomModel } from "./roomTypes";

const roomSchema = new mongoose.Schema<IRoomModel>({
        room: { type: String, required: true, ref: "Message" },
        users: { type: [String], required: true, ref: 'User' },
    },
    { timestamps: true }
)

const RoomModel = mongoose.model<IRoomModel>("Room", roomSchema)

export default RoomModel