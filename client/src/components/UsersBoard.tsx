import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { userRoomsRequest, newRoomRequest, searchUsersRequest } from '../services/chatServices'
import { IGetMessage, IRoom, IRoomFetched, ISearchUsers, IUsersBoardProps } from "../types/chatTypes";
import { useView } from "../context/viewContext";
import { useLocation, useNavigate } from "react-router-dom";
import { NavigateFunction } from "react-router/lib/hooks";
import { Location } from "history";
import "../styles/components/UsersBoard.sass"

function UsersBoard(props: IUsersBoardProps): JSX.Element {
    const userID = props.userID
    const socket = props.socket

    const navigate: NavigateFunction = useNavigate()
    const location: Location = useLocation()

    const [rooms, setRooms] = useState<IRoom[] | []>([])
    const [roomsJSX, setRoomsJSX] = useState<JSX.Element[] | []>([])

    const [searchUsers, setSearchUsers] = useState<ISearchUsers[] | []>([])
    const [searchJSX, setSearchJSX] = useState<JSX.Element[] | []>([])

    const { isMobile, showMessages, setShowMessages } = useView()
    const hideComponent: boolean = isMobile && showMessages

    const isMobileRef = useRef<boolean>(isMobile)
    const hideRef = useRef<boolean>(hideComponent)

    const roomsJSXCreator = (): JSX.Element[] | [] =>
        rooms?.map((room: IRoom, id: number) => {
            const roommate: string = room.users.find(user => user._id !== userID)!.username

            if (room.hidden) {
                return <div key={ id }/>
            }

            return (
                <div className="userBoard-rooms-user"
                     key={ id }
                     onClick={ () => {
                         joinRoom(room.id, roommate)
                     }}
                >
                    <img className="userBoard-rooms-user-image" alt=""/>
                    <div className="userBoard-rooms-user-details">
                        <div className="userBoard-rooms-user-details-name">
                            { roommate }
                        </div>
                        <div className="userBoard-rooms-user-details-lastMessage">
                            { room.lastMessage }
                        </div>
                    </div>
                </div>
            )
        })

    const searchJSXCreator = (): JSX.Element[] | [] =>
        searchUsers?.map((user: ISearchUsers, id: number) =>
            <div className="userBoard-search-results-user"
                 key={ id }
                 onClick={ () => {
                    createRoom(user)
                    setSearchUsers([])
                 }}
            >
                <img className="userBoard-search-results-user-image" alt=""/>
                <div className="userBoard-search-results-user-name">
                    { user.username }
                </div>
            </div>
        )

    const onUserSearch = (e: SyntheticEvent): void => {
        e.preventDefault()

        const input = e.target as typeof e.target & { value: string }
        const username = input.value

        username === ""
            ? setSearchUsers([])
            : searchUsersRequest(username)
                .then(response => response.data)
                .then(users => {
                    const newUsers = users.filter((newUser: ISearchUsers) => {
                        let match: boolean = false

                        rooms.forEach((room: IRoom) => {
                            room.users.forEach(user => {
                                if (user._id === newUser._id && !room.hidden) {
                                    match = true
                                }
                            })
                        })

                        return !match
                    })

                    setSearchUsers(newUsers)
                })
                .catch(() => {
                    setSearchUsers([])
                })
    }

    function userRooms(): void {
        userRoomsRequest(userID)
            .then(response => response.data.rooms)
            .then(rooms => {
                const sortedRooms: IRoom[] = rooms
                    .map((room: IRoomFetched) =>
                        ({...room, id: room.room, hidden: !room.lastMessage, lastMessageSent: room.lastMessageSent ? room.lastMessageSent : String(new Date()) }))
                    .sort((a: IRoom, b: IRoom) => new Date(a.lastMessageSent) < new Date(b.lastMessageSent) ? 1 : -1)

                setRooms(sortedRooms)
            })
    }

    function createRoom(targetUser: ISearchUsers): void {
        const targetUserID = targetUser._id
        const targetUsername = targetUser.username

        newRoomRequest(userID, targetUserID)
            .then(response => response.data)
            .then(room => {
                joinRoom(room.roomID, targetUsername)
            })
            .catch(error => {
                if (error.response.data.message === "Room already exists") {
                    const roomID: string = rooms
                        .find((room: IRoom) => room.users[0]._id === targetUserID || room.users[1]._id === targetUserID)!.id

                    joinRoom(roomID, targetUsername)
                }
            })
    }

    function joinRoom(roomID: string, roommate: string): void {
        if (isMobileRef.current && !hideRef.current) {
            setShowMessages(true)
        }
        localStorage.setItem("roommate", roommate)

        navigate({ pathname: `/chat/${roomID}` })
        socketJoinRoom(roomID)
    }

    function joinRooms(): void {
        rooms.forEach((room: IRoom) => {
            socketJoinRoom(room.id)
        })
    }

    function socketJoinRoom(roomID: string): void {
        socket.emit("joinRoom", roomID)
    }

    function socketOnReconnect(): void {
        socket.on("connect", () => {
            joinRooms()
        })
    }

    function socketOnPrivateMessage(): void {
        socket.on("private message", (message: IGetMessage) => {
            const updatedRooms: IRoom[] = rooms
                .map(room => room.id === message.roomID ? { ...room, lastMessage: message.message, lastMessageSent: String(new Date()) } : room)
                .sort((a: IRoom, b: IRoom) => new Date(a.lastMessageSent) < new Date(b.lastMessageSent) ? 1 : -1)

            setRooms(updatedRooms)
        })
    }

    function socketOnNewRoom(): void {
        socket.on("new room", () => {
            userRooms()
        })
    }

    useEffect(() => {
        userRooms()
        socketOnReconnect()
        socketOnNewRoom()

        return () => {
            socket.removeListener("connect")
            socket.removeListener("new room")
        }
    }, [])

    useEffect(() => {
        setRoomsJSX(roomsJSXCreator())
    }, [rooms])

    useEffect(() => {
        joinRooms()
    }, [rooms.length])

    useEffect(() => {
        socketOnPrivateMessage()

        return () => {
            socket.removeListener("private message")
        }
    }, [rooms, location])

    useEffect(() => {
        setSearchJSX(searchJSXCreator())
    }, [searchUsers])

    useEffect(() => {
        isMobileRef.current = isMobile
        hideRef.current = isMobile && showMessages
    }, [isMobile, showMessages])

    return (
        <div className="userBoard" style={ { "display": hideComponent ? "none" : "block" } }>
            <div className="userBoard-search">
                <div className="userBoard-search-form">
                    <input className="userBoard-search-form-input" type="text" placeholder="Username"
                           onChange={ onUserSearch }/>
                </div>
                <div className="userBoard-search-results">
                    { searchJSX }
                </div>
            </div>
            <div className="userBoard-rooms">
                { roomsJSX }
            </div>
        </div>
    )
}

export default UsersBoard