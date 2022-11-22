import { FieldValues } from "react-hook-form/dist/types/fields";

interface IUser {
    username: string
    password: string
}

interface IRegisterForm extends FieldValues, IUser {}

export type {
    IUser,
    IRegisterForm
}