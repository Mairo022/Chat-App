import { io, Socket } from "socket.io-client";
import Messages from "../components/Messages";
import Rooms from "../components/Rooms";
import { useEffect, useState } from "react";
import "../styles/pages/Chat.sass";
import { Location } from "history";
import { useLocation } from "react-router-dom";

function Chat(): JSX.Element {
    const userID: string = localStorage.getItem("userID") as string
    const username: string = localStorage.getItem("username") as string
    const URL: string = process.env.REACT_APP_PROXY as string

    const location: Location = useLocation()
    const currentRoom: string | undefined = location.pathname.split("/chat/")[1]
    const isInRoom: boolean = currentRoom !== undefined && currentRoom !== ""

    const [socket, setSocket] = useState<Socket | undefined>()
    const [socketConnected, setSocketConnected] = useState<boolean>(false)

    useEffect(() => {
        const ws = io(URL, {
            query: { username },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax : 5000,
            reconnectionAttempts: Infinity,
        })
        setSocket(ws)

        return () => {
            ws.close()
        }
    }, [])

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>

        if (socket !== undefined) {
            socket.on("connect", () => {
                setSocketConnected(true)
            })
            socket.on("disconnect", () => {
                timeout = setTimeout(() => {
                    setSocketConnected(socket.connected)
                }, 30000)
            })
        }

        return () => {
            socket?.removeListener("connect")
            socket?.removeListener("disconnect")
            clearTimeout(timeout)
        }
    },[socket])

    const chatJSX = (): JSX.Element => {
        return socket !== undefined && socketConnected
            ?   <>
                    <Rooms socket={ socket } url={ URL } userID={ userID } username={ username } isInRoom={ isInRoom }/>
                    <Messages socket={ socket } url={ URL } userID={ userID } username={ username } isInRoom={ isInRoom } currentRoom={ currentRoom }/>
                </>
            :   <p className="connecting">Connecting to chat</p>
    }

    return (
        <div className="Chat">
            { chatJSX() }
        </div>
    )
}

export default Chat