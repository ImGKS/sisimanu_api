const socket = require('socket.io');
const crypto = require('crypto');
const { Chat } = require('../models/chat')

const getHashedRoomId = (loggedInUserId, toUserId) => {
    return crypto
    .createHash("sha256")
    .update([loggedInUserId, toUserId].sort().join("_"))
    .digest("hex")
}

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: [
                "https://sisimanu-web.vercel.app",
                "http://localhost:5173"
            ],
        }
    })

    const onlineUsers = new Map();

    //accept incoming chat request
    io.on('connection', (socket) => {
        // handle event
        socket.on("joinChat", ({loggedInUserId, toUserId}) => {
            // a room to create for both user to chat
            const roomId = getHashedRoomId(loggedInUserId, toUserId);    
            socket.join(roomId);

            // Track online users
            if (!onlineUsers.has(loggedInUserId)) {
                onlineUsers.set(loggedInUserId, new Set());
            }
            onlineUsers.get(loggedInUserId).add(socket.id);

             // ✅ Notify the current user that the toUserId is online (if they are)
            const toUserSockets = onlineUsers.get(toUserId);
            if (toUserSockets && toUserSockets.size > 0) {
                socket.emit("user-online", toUserId); // this notifies the user who just joined
            }
        
            // Notify the other user
            socket.to(roomId).emit("user-online", loggedInUserId);
        })

        socket.on("sendMessage", async ({
            firstName,
            loggedInUserId,
            toUserId,
            text,
            profilePic,
            time
        }) => {
            // send message to room
            // roomId should be same
            const roomId = getHashedRoomId(loggedInUserId, toUserId);

            // save messages to db
            // if chat exists, append otherwise create
            try {

                let chat = await Chat.findOne({
                    participants: { $all: [loggedInUserId, toUserId]}
                })

                if (!chat) {
                    chat = new Chat({
                        participants: [loggedInUserId, toUserId],
                        messages: [],
                    })
                }

                chat.messages.push({
                    senderId: loggedInUserId,
                    text
                })

                await chat.save()

                // server sending message
                io.to(roomId).emit("messageReceived", { 
                    firstName,
                    loggedInUserId,
                    toUserId,
                    text,
                    profilePic,
                    time
                })                          

            } catch (error) {
                console.error(error)
            }
        })

        socket.on("leaveChat", ({ loggedInUserId, toUserId }) => {
            const roomId = getHashedRoomId(loggedInUserId, toUserId);
            socket.leave(roomId);
            socket.to(roomId).emit("user-offline", loggedInUserId);
        });

        socket.on("disconnect", () => {
            for (const [userId, sockets] of onlineUsers.entries()) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                  onlineUsers.delete(userId);
                  io.emit("user-offline", userId);
                }
            }
        })
    })
}

module.exports = initializeSocket