import UserModel from './userModel'
import { IUser } from "./userTypes"

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function register(req, res): Promise<void> {
    const { username, password }: IUser = req.body
    const userExists = () => UserModel.exists({ username })

    if (username === undefined) throw ("Username is required")
    if (username.length < 4) throw ("Minimum username length is 4 characters")
    if (username.length > 20) throw ("Maximum username length is 20 characters")

    if (password === undefined) throw ("Password is required")
    if (password.length < 8) throw ("Minimum password length is 8 characters")
    if (password.length > 255) throw ("Maximum password length is 255 characters")

    if (await userExists()) throw ("Username already exists")

    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS as string))
    const passwordHashed = await bcrypt.hashSync(password, salt)

    const user = new UserModel({
        username: username,
        password: passwordHashed
    })

    await user.save()

    res.status(201).json({ message: "User registered" })
}

async function login(req, res): Promise<void> {
    const { username, password }: IUser = req.body
    const user = await UserModel.findOne({ username })
    const passwordMatch = () => bcrypt.compare(password, user?.password)

    if (user === null) throw ("User not found")
    if (!await passwordMatch()) throw ("Wrong password")

    res.cookie('token', token({ userID: user._id }), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60000 * 60 * 24 * 30
    })

    res.status(201).json({ userID: user._id, username: user.username })
}

const token = (userID: object): string =>
    jwt.sign(userID, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })

export default {
    register,
    login
}