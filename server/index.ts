import express, { Express } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import socketIo from "./socketIo";
import { chatRoute } from "./features/chat/chatRoute";
import { userRoute } from "./features/user/userRoute";
import { roomRoute } from "./features/room/roomRoute";

require('dotenv').config()

const clientURL = process.env.CLIENT_URL || "http://localhost:3000"
const port = process.env.PORT || 80
const app: Express = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: clientURL,
    },
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', clientURL)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    next()
})

app.use(express.json())
app.use('/chat/', chatRoute)
app.use('/chat/rooms/', roomRoute)
app.use('/', userRoute)

app.set('io', io)
socketIo(io)

httpServer.listen(port, () =>
    console.log(`Server running on port: ${ port }`))

mongoose.connect(process.env.MONGODB_URI as string)
    .catch(() => { console.log("Could not connect to MongoDB") })

mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB")
})
mongoose.connection.on("disconnected", () => {
    console.log("Connection to MongoDB lost")
})

export default httpServer