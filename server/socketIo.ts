function socketIo(io) {
    const connectedUsers: Map<string, string> = new Map()

    io.on("connection", socket => {
        const username: string = socket.handshake.query.username
        const userSocketID: string = socket.id

        connectedUsers.set(username, userSocketID)

        socket.on('joinRoom', (roomID: string) => {
            socket.join(roomID)
        })

        socket.on("private message", ({ message, sender, receiver, roomID, isInitial }) => {
            if (isInitial === true) {
                const receiverSocketID = connectedUsers.get(receiver)
                const senderSocketID = connectedUsers.get(sender)

                if (receiverSocketID !== undefined) {
                    io.to(receiverSocketID).emit("new room")
                }

                if (senderSocketID !== undefined) {
                    io.to(senderSocketID).emit("new room")
                }
            }

            io.to(roomID).emit("private message", {
                message,
                sender: { username: sender },
                roomID,
            })
        })

        socket.on("disconnect", () => {
            connectedUsers.delete(username)
            clientsCountLogger(io.engine.clientsCount)
        })

        clientsCountLogger(io.engine.clientsCount)
    })

    io.engine.on("connection_error", e => {
        console.log(e.message)
    })
}

const clientsCountLogger = (clients: number) => {
    console.log(`Connection established with ${ clients } clients`)
}

export default socketIo