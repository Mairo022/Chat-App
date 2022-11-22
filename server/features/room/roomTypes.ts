interface IRoomModel {
    room: string,
    users: Array<string>
}

interface IUserRooms {
    userID: string
}

interface ICreateRoom {
    userID: string
    targetUserID: string
}

export type {
    ICreateRoom,
    IUserRooms,
    IRoomModel
}