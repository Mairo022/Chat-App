interface IMessage {
    message: string
    sender: string
    roomID: string
}

interface IMessageModel {
    message: string
    sender: string
    room: string
    createdAt: Date
}

interface IGetMessages {
    roomID: string
}

interface ISearchUsers {
    username: string
}

export {
    IMessage,
    IMessageModel,
    IGetMessages,
    ISearchUsers
}