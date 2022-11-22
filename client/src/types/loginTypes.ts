import { FieldValues } from "react-hook-form/dist/types/fields";

interface IUser {
    username: string
    password: string
}

interface ILogin {
    userID: string
    username: string
}

interface ILoginForm extends FieldValues, IUser {}

export type {
    IUser,
    ILogin,
    ILoginForm
}