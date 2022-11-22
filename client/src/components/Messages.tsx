import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { IGetMessage, IMessagesProps } from "../types/chatTypes";
import { Location } from "history";
import { sendMessageRequest, messagesRequest } from '../services/chatServices'
import { useView } from "../context/viewContext";
import { useLocation, useNavigate } from "react-router-dom";
import { NavigateFunction } from "react-router/lib/hooks";

function Messages(props: IMessagesProps): JSX.Element {
    const senderName = props.username
    const senderID = props.userID
    const socket = props.socket

    const navigate: NavigateFunction = useNavigate()
    const location: Location = useLocation()
    const roomID: string | undefined = location.pathname.split("/chat/")[1]
    const roommate = localStorage.getItem("roommate")

    const [messageInput, setMessageInput] = useState<string>("")
    const [messageHistory, setMessageHistory] = useState<IGetMessage[]>([])
    const [messagesJSX, setMessagesJSX] = useState<JSX.Element[] | []>([])

    const { isMobile, showMessages, setShowMessages } = useView()
    const hideComponent: boolean = isMobile && !showMessages

    const lastMessageRef = useRef<HTMLDivElement | null>(null)
    const scrollToLastMessage = (): void => { lastMessageRef.current?.scrollIntoView() }

    const errorMessage = (message: string): IGetMessage =>
        ({
            sender: { username: "Server", _id: "server" },
            message: message,
            roomID: roomID
        })

    const onMessageSubmit = (e: SyntheticEvent): void => {
        e.preventDefault()

        if (messageInput === "") return
        setMessageInput(input => input.trim())

        sendMessageRequest({
            message: messageInput,
            sender: senderID,
            roomID: roomID
        })
            .then(() => {
                socket.emit("private message", {
                    message: messageInput,
                    sender: senderName,
                    receiver: roommate,
                    roomID: roomID,
                    isInitial: !messageHistory.length
                })
            })
            .catch(() => {
                setMessageHistory(oldMessages => [ ...oldMessages, errorMessage("Error sending the message") ])
            })

        setMessageInput("")
    }

    const messagesJSXCreator = (): JSX.Element[] | [] => {
        return messageHistory?.map((message: IGetMessage, id: number) =>
            <div className="messages-msgs-msg" key={ id }>
                <div className="messages-msgs-msg-details">
                    <div className="messages-msgs-msg-details-name">{ message.sender.username }</div>
                    <div className="messages-msgs-msg-details-time"></div>
                </div>
                <div className="messages-msgs-msg-text">
                    { message.message }
                </div>
            </div>
        )
    }

    function onHideMessages(): void {
        if (isMobile && showMessages) {
            setShowMessages(false)
        }
    }

    function handleEnter(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
        e.key === "Enter" && !e.shiftKey && onMessageSubmit(e)
        e.key === "Enter" && e.shiftKey && setMessageInput(
            input => (input + "\n").replace(/(\r?\n|\r)(?!.*\1)/g, "")
        )
    }

    function loadMessages(): void {
        if (roomID === "" || roomID === undefined) return

        messagesRequest(roomID)
            .then(response => response.data)
            .then(messages => { setMessageHistory(messages) })
            .catch(e => {
                if (e.response.status == 404) {
                    navigate("/chat", { replace: true })
                } else {
                    setMessageHistory([ errorMessage("Error retrieving messages") ])
                }
            })
    }

    function socketOnPrivateMessage(): void {
        socket.on("private message", (message: IGetMessage) => {
            if (message.roomID == roomID) {
                setMessageHistory(oldMessages => [ ...oldMessages, message ])
            }
        })
    }

    useEffect(() => {
        loadMessages()
        socketOnPrivateMessage()

        return () => {
            socket.removeListener("private message")
        }
    }, [roomID])

    useEffect(() => {
        setMessagesJSX(messagesJSXCreator())
    }, [messageHistory])

    useEffect(() => {
        scrollToLastMessage()
    }, [messagesJSX])

    return roomID !== undefined && roomID !== "" ?
           <div className="messages" style={
            { "display": hideComponent ? "none" : "grid" }
           }>
               <div className="messages-bar">
                   <div className="messages-bar-menu" onClick={ () => { onHideMessages() } }>
                       { isMobile ? "\u21D0" : "" }
                   </div>
                   <div className="messages-bar-roommate">{ roommate }</div>
               </div>

               <div className="messages-msgs">
                   { messagesJSX }
                   <div className="messages-msgs-msg-last" ref={ lastMessageRef }/>
               </div>

               <form className="messages-form" onSubmit={ onMessageSubmit }>
                <textarea rows={ 3 } cols={ 1 } className="messages-form-inputMsg"
                          onKeyPress={ handleEnter }
                          onChange={ e => { setMessageInput(e.target.value) } }
                          value={ messageInput }
                />
               </form>
           </div>
           :
           <></>;
}

export default Messages