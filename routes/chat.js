const express = require("express");
const { Chat } = require("../models/chat");
const userAuth = require("../middleware/auth");

const chatRouter = express.Router();

chatRouter.get("/chat/:toUserId", userAuth, async(req, res) => {
    const loggedInUser = req.user._id;
    const toUserId = req.params.toUserId;

    try {
        let chat = await Chat.findOne({
            participants: { $all: [loggedInUser, toUserId]}
        })
        .select({ messages: { $slice: -5 } })
        .populate({
            path: "messages.senderId",
            select: "firstName profilePic"
        })

        if(!chat) {
            chat = new Chat({
                participants: [loggedInUser, toUserId],
                messages: []
            })
            await chat.save()
        }
        return res.json({data: chat})
    } catch (error) {
        console.log(error)
    }
})

module.exports = { chatRouter }