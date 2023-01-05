import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { IGetMessage, IMessagesProps } from "../types/chatTypes";
import { sendMessageRequest, messagesRequest } from '../services/chatServices'
import { useView } from "../context/viewContext";
import { useNavigate } from "react-router-dom";
import { NavigateFunction } from "react-router/lib/hooks";
import "../styles/components/Messages.sass";

function Messages(props: IMessagesProps): JSX.Element {
    const senderName = props.username
    const senderID = props.userID
    const socket = props.socket
    const roomID = props.currentRoom
    const isInRoom = props.isInRoom

    const navigate: NavigateFunction = useNavigate()
    const roommate = localStorage.getItem("roommate")

    const [privateMessage, setPrivateMessage] = useState<IGetMessage>()
    const [messageInput, setMessageInput] = useState<string>("")
    const [messageHistory, setMessageHistory] = useState<IGetMessage[]>([])
    const [messagesJSX, setMessagesJSX] = useState<JSX.Element[] | []>([])

    const { isMobile } = useView()
    const [hideComponent, setHideComponent] = useState<boolean>()

    const lastMessageRef = useRef<HTMLDivElement | null>(null)
    const scrollToLastMessage = (): void => { lastMessageRef.current?.scrollIntoView() }

    const errorMessage = (message: string): IGetMessage =>
        ({
            sender: { username: "Server", _id: "server" },
            message: message,
            roomID: roomID ? roomID : "",
            createdAt: String(new Date())
        })

    const onMessageSubmit = (e: SyntheticEvent): void => {
        e.preventDefault()

        if (messageInput === "") return
        setMessageInput(input => input.trim())

        if (roomID === undefined || roomID === "") {
            return handleErrorOnSend()
        }

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
                handleErrorOnSend()
            })

        setMessageInput("")
    }

    const timeString = (time: string): string =>
        new Date(time).toLocaleTimeString("default", {
            hour: '2-digit',
            minute: '2-digit',
        })

    const messagesJSXCreator = (): JSX.Element[] | [] => {
        return messageHistory?.map((message: IGetMessage, id: number) => {
            const previousMessageCreatedAt: string | null = id > 0 ? messageHistory[id - 1].createdAt : null
            const messageCreatedAt = message.createdAt
            const sender: string = message.sender.username === senderName ? "me" : "roommate"

            const showDate: boolean = !!previousMessageCreatedAt && isDateDifferent(messageCreatedAt, previousMessageCreatedAt)

            const messageDateJSX: JSX.Element = (
                <div className="messages__date">
                    <div className="messages__date__text">
                        { dateString(messageCreatedAt) }
                    </div>
                </div>
            )

            return (
                <React.Fragment key={ id }>
                    { showDate && messageDateJSX }
                    <div className={`messages__message messages__message--${sender}`}>
                        <div className="messages__message__text">
                            { message.message }
                        </div>
                        <div className="messages__message__time">
                            { timeString(messageCreatedAt) }
                        </div>
                    </div>
                </React.Fragment>
            )
        })
    }

    function isDateDifferent(d1: string, d2: string): boolean {
        return new Date(d1).toLocaleDateString() !== new Date(d2).toLocaleDateString()
    }

    function dateString(date: string): string {
        const dateNow: Date = new Date()
        const dateOld: Date = new Date(date)
        const dateYesterday: Date = new Date(dateNow.getTime() - 1000 * 60 * 60 * 24)

        if (dateNow.toLocaleDateString() === dateOld.toLocaleDateString()) {
            return "Today"
        }
        if (dateYesterday.toLocaleDateString() === dateOld.toLocaleDateString()) {
            return "Yesterday"
        }

        return dateOld.toLocaleDateString("default", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })
    }

    function onHideMessages(): void {
        navigate("/chat")
        setHideComponent(true)
    }

    function handleEnter(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
        if (e.key === "Enter" && !e.shiftKey) {
            onMessageSubmit(e)
        }
    }

    function handleErrorOnSend(): void {
        setMessageHistory(oldMessages => [ ...oldMessages, errorMessage("Error sending the message") ])
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

    function updateMessages(): void {
        if (privateMessage !== undefined && privateMessage.roomID == roomID) {
            setMessageHistory(oldMessages => [ ...oldMessages, privateMessage ])
        }
    }

    function socketOnPrivateMessage(): void {
        socket.on("private message", (message: IGetMessage) => {
            setPrivateMessage(message)
        })
    }

    useEffect(() => {
        socketOnPrivateMessage()

        return () => {
            socket.removeListener("private message")
        }
    }, [])

    useEffect(() => {
        updateMessages()
    }, [privateMessage])

    useEffect(() => {
        loadMessages()
    }, [roomID])

    useEffect(() => {
        setMessagesJSX(messagesJSXCreator())
    }, [messageHistory])

    useEffect(() => {
        scrollToLastMessage()
    }, [messagesJSX])

    useEffect(() => {
        if (!isMobile || (isMobile && isInRoom)) {
            setHideComponent(false)
        } else {
            setHideComponent(true)
            setMessageHistory([])
        }
    }, [isMobile, isInRoom])

    return roomID !== undefined && roomID !== "" ?
           <div className="Messages" style={
            { "display": hideComponent ? "none" : "grid" }
           }>
               <div className="header">
                   <div className="header__rooms_btn" onClick={ () => { onHideMessages() } }>
                       { isMobile ? "←" : "" }
                   </div>
                   <div className="header__roommate">
                       <div className="header__roommate__image"/>
                       <div className="header__roommate__name">{ roommate }</div>
                   </div>
               </div>

               <div className="messages">
                   { messagesJSX }
                   <div className="messages__message--last" ref={ lastMessageRef }/>
               </div>

               <form className="form" onSubmit={ onMessageSubmit }>
                   <textarea rows={ 1 } cols={ 1 } className="form__inputMsg"
                          onKeyPress={ handleEnter }
                          onChange={ e => { setMessageInput(e.target.value) } }
                          value={ messageInput }
                    />
                   <button className="form__submit" type="submit"/>
               </form>
           </div>
           :
           <></>;
}

export default Messages