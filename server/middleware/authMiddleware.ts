import UserModel from "../features/user/userModel";
import jwt from "jsonwebtoken"

const jwtAuth = async (req, res, next) => {
    const cookies: Array<string> | undefined = req.headers.cookie?.split("; ")
    const tokenCookie: string | undefined = cookies?.find(cookie => cookie.startsWith('token='))
    const token = tokenCookie?.split("token=")[1]

    if (token !== undefined) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await UserModel.findById(decoded.id).select('-password')

            next()
        } catch (e) {
            res.status(401).json({ error: "Not authorized" })
        }
    } else {
        res.status(401).json({ error: "Not authorized" })
    }
}

export {
    jwtAuth
}