import { ISendMessage } from "../types/chatTypes";
import axios, { AxiosInstance, AxiosPromise } from "axios";

const URL: string = process.env.REACT_APP_PROXY as string

const axiosChat: AxiosInstance = axios.create({
    withCredentials: true
})

function sendMessageRequest(message: ISendMessage): AxiosPromise {
    return axiosChat.post(`${ URL }/chat/send-message`, {
        message: message.message,
        sender: message.sender,
        roomID: message.roomID
    })
}

const messagesRequest = (roomID: string): AxiosPromise =>
    axiosChat.post(`${ URL }/chat/get-messages`, {
        roomID
    })

const newRoomRequest = (userID: string, targetUserID: string): AxiosPromise =>
    axiosChat.post(`${ URL }/chat/rooms/create/`, {
        userID,
        targetUserID
    })

const userRoomsRequest = (userID: string): AxiosPromise =>
    axiosChat.post(`${ URL }/chat/rooms/`, {
        userID
    })

const searchUsersRequest = (username: string): AxiosPromise =>
    axiosChat.post(`${ URL }/chat/search-user/`, {
        username
    })

export {
    sendMessageRequest,
    messagesRequest,
    userRoomsRequest,
    newRoomRequest,
    searchUsersRequest
}