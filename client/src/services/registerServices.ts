import { IUser } from "../types/registerTypes";
import axios, { AxiosPromise } from "axios";

const registerRequest = (user: IUser, url: string): AxiosPromise =>
    axios.post(`${ url }/register`, {
        username: user.username,
        password: user.password
    })

export {
    registerRequest
}