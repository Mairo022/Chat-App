import ChatMessageModel from './chatMessageModel'
import UserModel from "../user/userModel";
import { IGetMessages, IMessage, ISearchUsers } from "./chatTypes";
import { roomExists } from "../room/roomController"

async function sendMessage(req, res): Promise<void> {
    const { message, sender, roomID }: IMessage = req.body

    if (message === undefined || sender === undefined || roomID === undefined) throw ("Message is in an incorrect form")

    const chatMessage = new ChatMessageModel({
        message: message,
        sender: sender,
        room: roomID
    })

    await chatMessage.save()

    res.status(201).json({ message: "Message sent" })
}

async function getMessages(req, res): Promise<void> {
    const { roomID }: IGetMessages = req.body

    if (roomID === null || roomID === undefined) throw ("Missing room's id")
    if (!await roomExists(roomID)) throw ({ message: "Unknown room", code: 404 })

    const messages = (
        await ChatMessageModel
            .find({ room: roomID })
            .sort({ createdAt: 'descending' })
            .limit(20)
            .populate('sender', 'username')
    ).reverse()

    res.status(200).json(messages)
}

async function searchUser(req, res): Promise<void> {
    const { username }: ISearchUsers = req.body

    if (username === undefined) throw ("Missing username")

    const user = await UserModel.find({ username: { $regex: "^" + username, $options: "i" } }).select("username _id")

    res.status(200).json(user)
}

export default {
    sendMessage,
    getMessages,
    searchUser
}