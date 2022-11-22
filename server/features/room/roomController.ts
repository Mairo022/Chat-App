import RoomModel from "./roomModel";
import { randomUUID } from "crypto";
import { ICreateRoom, IUserRooms } from "./roomTypes";
import ChatMessageModel from "../chat/chatMessageModel";

const roomExists = (id: string) => RoomModel.exists({ room: id })
const usersHaveRoom = (firstID: string, secondID: string) => RoomModel.exists({ users: { $all: [firstID, secondID] } })

async function createRoom(req, res): Promise<void> {
    const { userID, targetUserID }: ICreateRoom = req.body

    if (!userID || !targetUserID) throw ("userID or targetUserID is missing")
    if (await usersHaveRoom(userID, targetUserID)) throw ({ message: "Room already exists", code: 400 } )

    const roomID = randomUUID()
    const room = new RoomModel({
        room: roomID,
        users: [userID, targetUserID]
    })

    await room.save()

    res.status(201).json({ roomID })
}

async function userRooms(req, res): Promise<void> {
    const { userID }: IUserRooms = req.body

    if (!userID) throw ("userID is missing")

    const rooms = await RoomModel.find({ users: userID })
        .select({ _id: false, room: true, users: true })
        .populate('users', 'username')

    const roomsWithMessage = await Promise.all(rooms.map(async room => {
        const lastMessage = await ChatMessageModel
            .findOne({ room: room.room })
            .sort({ createdAt: 'descending' })
            .select({ _id: false, message: true, createdAt: true })

        return {
            room: room.room,
            users: room.users,
            lastMessage: lastMessage?.message,
            lastMessageSent: lastMessage?.createdAt
        }
    }))

    res.status(200).json({ rooms: roomsWithMessage })
}

export default {
    userRooms,
    createRoom
}

export { roomExists, usersHaveRoom }