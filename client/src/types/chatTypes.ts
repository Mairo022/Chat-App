import { Socket } from "socket.io-client";

interface  IGetMessage {
    message: string
    sender: {
        _id: string
        username: string
    }
    roomID: string
}

interface ISendMessage {
    message: string
    sender: string
    roomID: string
}

interface IMessagesProps {
    username: string
    userID: string
    socket: Socket
    url: string
}

interface IRoomFetched {
    room: string
    users: {
        _id: string
        username: string
    }[]
    lastMessage?: string
    lastMessageSent?: string
}

interface IRoom extends IRoomFetched {
    id: string
    hidden: boolean
    lastMessageSent: string
}

interface IRoomsProps {
    username: string
    socket: Socket
    userID: string
    url: string
}

interface IUserControlsProps {
    username: string
    userID: string
}

interface ISearchUsers {
    username: string
    _id: string
}

export type {
    IGetMessage,
    ISendMessage,
    IMessagesProps,
    IRoom,
    IRoomFetched,
    IUserControlsProps,
    IRoomsProps,
    ISearchUsers
}