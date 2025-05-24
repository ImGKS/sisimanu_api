const express = require('express');
const userAuth = require('../middleware/auth');
const { validateEditProfileData } = require('../utils/validation');
const profileRouter = express.Router();
const User = require('../models/user');
const { USER_SAFE_DATA } = require('../utils/constants');

profileRouter.get("/profile/view", userAuth, (req, res) => {
    try {
        res.send(req.user)
    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})

profileRouter.patch("/profile/edit", userAuth, async (req, res)=>{
    try {
        const loggedInUser = req.user;
        const isUpdateAllowed = validateEditProfileData(req);

        if (!isUpdateAllowed) {
            return res.send("Update not allowed.")
        }

        Object.keys(req.body).forEach(key => {
                loggedInUser[key] = req.body[key]
        })
        const updatedUserData = await loggedInUser.save()
        res.json({message:"User data updated successfully.", data:updatedUserData})
    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})

profileRouter.delete("/profile", userAuth, async(req, res) => {
    const { userId } = req.body;
    try {
        await User.findByIdAndDelete({_id: userId})
        res.send("User deleted successfully.")
    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})

profileRouter.get("/profile/:userId", userAuth, async(req, res) => {
    const userId  = req.params.userId;
    try {
        const userData = await User.findById({_id: userId}).select(USER_SAFE_DATA)
        res.json({message:"User data fetched successfully.", data:userData})
    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})

profileRouter.get("/profile/user/get/:emailId", userAuth, async(req, res) => {
    const emailId  = req.params.emailId;
 
    try {
        const userData = await User.find({emailId: emailId}).select(['firstName', 'lastName', 'age', 'profilePic', 'gender'])

        if (!userData) {
            res.json({message:"No user found."})
        }
        res.json({message:"User data fetched successfully.", data:userData})
    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})

module.exports = profileRouter;