const express = require('express');
const requestRouter = express.Router();
const userAuth = require('../middleware/auth');
const User = require('../models/user');
const connectionRequest = require('../models/connectionRequest')
const {ALLOWED_REQUEST_STATUS, ALLOWED_ACTION_REQUEST_STATUS} = require("../utils/constants")
const { redis_client } = require('./redis');

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const fromUserId = loggedInUser._id.toString();
        const toUserId = req.params.toUserId;
        const status = req.params.status

        if (!ALLOWED_REQUEST_STATUS.includes(status)) {
            return res.json({message: 'Invalid status type.'})
        }

        // Already existing connection request
        const isRequestSent = await connectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        })

        if(isRequestSent) {
           return res.json({message: 'Connection request already sent.'})
        }

        // Check if userId exist
        const toUser = await User.findById(toUserId)
        if(!toUser) {
           return res.json({message: 'User does not exists.'})
        }

        const connectionRequestInstance = new connectionRequest({
            fromUserId, toUserId, status
        })

        await connectionRequestInstance.save()
        res.json({
            message: "request updated successfully.",
        })

    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const {status, requestId} = req.params

        if (!ALLOWED_ACTION_REQUEST_STATUS.includes(status)) {
            return res.json({message: 'Invalid status type.'})
        }

        // check incoming connection request
        const connectionRequestCame = await connectionRequest.findOne({
            fromUserId: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        })

        if(!connectionRequestCame) {
            res.json({message: 'Connection request not found.'})
        }

        connectionRequestCame.status = status //incoming
        const data = await connectionRequestCame.save()

        await redis_client.del(JSON.stringify(req?.user?._id));

        res.json({
            message: "request accepted.",
            data: data
        })

    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})


module.exports = requestRouter