const express = require('express');
const userRouter = express.Router();
const userAuth = require('../middleware/auth');
const connectionRequest = require('../models/connectionRequest');
const { USER_SAFE_DATA } = require('../utils/constants');
const User = require('../models/user');
const { redis_client } = require('./redis');

// get all pending request
userRouter.get("/user/received/request", userAuth, async(req, res) => {
    try {
        const loggedInUser = req.user;
        const pendingConnectionRequest = await connectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate('fromUserId', USER_SAFE_DATA)

        res.json({message:'Fetch request successfully', data:pendingConnectionRequest})
    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})

userRouter.get("/user/connections", userAuth, async(req, res) => {
    try {
        const cacheValue = await redis_client.get(JSON.stringify(req?.user?._id), (err, val) => {return val})
        if (cacheValue) {
            return res.json({message:'Fetch request successfully', data:JSON.parse(cacheValue)})
        }

        const loggedInUser = req.user;
        const pendingConnectionRequest = await connectionRequest.find({
            $or: [
                // Incoming request
                {
                    toUserId: loggedInUser._id,
                    status: 'accepted'
                },
                // Sent request
                {
                    fromUserId: loggedInUser._id,
                    status: 'accepted'
                }
            ]
        })
        .populate('fromUserId', USER_SAFE_DATA)
        .populate('toUserId', USER_SAFE_DATA)

        const data = pendingConnectionRequest.map((request) => {
            if(request.fromUserId?._id.toString() ===  loggedInUser._id.toString()) {
                return request.toUserId
            }
            return request.fromUserId
        })

        // set to redis
        redis_client.set(JSON.stringify(req?.user?._id), JSON.stringify(data), { EX: 3000 })
        
        res.json({message:'Fetch request successfully', data:data})
    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})

userRouter.get("/feed", userAuth, async(req, res) => {
    try {
        const loggedInUser = req.user;
        const pageNo = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 30 ? 30 : limit
        const skip = (pageNo - 1) * limit;

        const allConnectionRequest = await connectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id.toString() },
                { toUserId: loggedInUser._id.toString() }
            ]
        }).select(['fromUserId', 'toUserId'])
        .skip(skip)
        .limit(limit)

        const hideUserFromFeed = new Set();

        allConnectionRequest.forEach((req) => {
            hideUserFromFeed.add(req.fromUserId)
            hideUserFromFeed.add(req.toUserId)
        })

        const feedUsers = await User.find({
            $and: [
                {_id: {$nin: Array.from(hideUserFromFeed)}},
                {_id: {$ne: loggedInUser._id}}
            ]
        }).select(USER_SAFE_DATA)
        .skip(skip)
        .limit(limit)

        res.json({message:'Fetch request successfully', data:feedUsers})
    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})


module.exports = userRouter