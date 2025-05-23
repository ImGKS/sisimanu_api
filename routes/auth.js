const express = require('express');
const authRouter = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {validateSignupData} = require('../utils/validation');
const { redis_client } = require('./redis');

authRouter.post("/signup", async(req, res) => {
    try {
        const user = req.body;

        // validate incoming req.
        const isDataValid = validateSignupData(req);

        if(!isDataValid) {
            return res.status(401).json({message: "Invalid Data."})
        }

        // encrypt the password
        const hashedPassword = await bcrypt.hash(user.password, 10)

        const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            password: hashedPassword,
            age: user.age,
            profilePic: user.profilePic,
            gender: user.gender,
            skills: user.skills,
            about: user.about,
        }

        // create instance of model
        const userModal = new User(userData);
        await userModal.save();
        return res.status(200).json({message: "User added successfully."})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

authRouter.post("/login", async(req, res) => {
    const { emailId, password } = req.body;
    try {
        const isUserPresent = await User.findOne({emailId: emailId});
        
        if(!isUserPresent) {
            throw new Error ("Invalid credential.")
        }
        
        const isPasswordValid = await bcrypt.compare(password, isUserPresent.password);
        if(isPasswordValid) {
            // create a token
            const token = jwt.sign({id:isUserPresent._id.toString()}, "Tinder_GO_SECRET_KEY")
            // set token in cookies
            res.cookie("token", token, {httpOnly: true, secure: true, sameSite: "None"})
            res.status(200).send(isUserPresent);
        } else {
            throw new Error('Invalid credential.')
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

authRouter.post("/logout", (req, res) => {
    try {
        res.cookie("token", null, {expires: new Date(0)})
        redis_client.flushAll()
        return res.send("logout successfully.")
    } catch (error) {
        res.send("ERROR: " + error.message)
    }
})

module.exports = authRouter;