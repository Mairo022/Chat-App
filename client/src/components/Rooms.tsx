import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { userRoomsRequest, newRoomRequest, searchUsersRequest } from '../services/chatServices'
import { IGetMessage, IRoom, IRoomFetched, ISearchUsers, IRoomsProps } from "../types/chatTypes";
import { useView } from "../context/viewContext";
import { useNavigate } from "react-router-dom";
import { NavigateFunction } from "react-router/lib/hooks";
import "../styles/components/Rooms.sass"
import PersonalMenu from "./PersonalMenu";

function Rooms(props: IRoomsProps): JSX.Element {
    const username = props.username
    const userID = props.userID
    const socket = props.socket

    const navigate: NavigateFunction = useNavigate()
    const [showPersonalMenu, setShowPersonalMenu] = useState(false)
    const [privateMessage, setPrivateMessage] = useState<IGetMessage>()

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
                <div className={ `rooms__user rooms__user--` }
                     key={ id }
                     onClick={ () => {
                         joinRoom(room.id, roommate)
                     }}
                >
                    <img className="rooms__user__image" alt=""/>
                    <div className="rooms__user__details">
                        <div className="rooms__user__details__name">
                            { roommate }
                        </div>
                        <div className="rooms__user__details__lastMessageTime">
                            { timeString(room.lastMessageSent) }
                        </div>
                        <div className="rooms__user__details__lastMessage">
                            { room.lastMessage }
                        </div>
                    </div>
                </div>
            )
        })

    const searchJSXCreator = (): JSX.Element[] | [] =>
        searchUsers?.map((user: ISearchUsers, id: number) =>
            <div className="search__results__user"
                 key={ id }
                 onClick={ () => {
                     createRoom(user)
                     setSearchUsers([])
                 }}
            >
                <div className="search__results__user__image"/>
                <div className="search__results__user__details">
                    <div className="search__results__user__details__name">
                        { user.username }
                    </div>
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

    const timeString = (time: string) => {
        const inputTime = new Date(time)
        const curTime = new Date()

        if (curTime.toLocaleDateString() !== inputTime.toLocaleDateString()) {
            return inputTime.toLocaleDateString()
        }

        return inputTime.toLocaleTimeString('default', {
            hour: '2-digit',
            minute: '2-digit',
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

    function updateRooms(): void {
        if (privateMessage === undefined) return

        const updatedRooms: IRoom[] = rooms
            .map(room => room.id === privateMessage.roomID ? { ...room, lastMessage: privateMessage.message, lastMessageSent: String(new Date()) } : room)
            .sort((a: IRoom, b: IRoom) => new Date(a.lastMessageSent) < new Date(b.lastMessageSent) ? 1 : -1)

        setRooms(updatedRooms)
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
            setPrivateMessage(message)
        })
    }

    function socketOnNewRoom(): void {
        socket.on("new room", () => {
            userRooms()
        })
    }

    useEffect(() => {
        userRooms()
        socketOnPrivateMessage()
        socketOnReconnect()
        socketOnNewRoom()

        return () => {
            socket.removeListener("private message")
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
        updateRooms()
    },[privateMessage])

    useEffect(() => {
        setSearchJSX(searchJSXCreator())
    }, [searchUsers])

    useEffect(() => {
        isMobileRef.current = isMobile
        hideRef.current = isMobile && showMessages
    }, [isMobile, showMessages])

    return (
        <div className="Rooms" style={ { "display": hideComponent ? "none" : "block" } }>
            <div className="header" onClick={ () => { setShowPersonalMenu(prevState => !prevState) } }>
                <div className="header__user__image"/>
                <div className="header__user__name">{ username }</div>
                <div className={ `header__user__menu header__user__menu_status--${ showPersonalMenu ? "open" : "closed" }` }/>
            </div>
            <div className="personal_menu">
                { showPersonalMenu && <PersonalMenu/> }
            </div>
            <div className="search">
                <input className="search__input" type="text" placeholder="Search" onChange={ onUserSearch }/>
                <div className="search__results">
                    { searchJSX }
                </div>
            </div>
            <div className="rooms">
                { roomsJSX }
            </div>
        </div>
    )
}

export default Rooms