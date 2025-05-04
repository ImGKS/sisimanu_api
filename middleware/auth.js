
const User = require('../models/user');
const jwt = require('jsonwebtoken')

const userAuth = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        const { token } = cookies;
        if(!token) {
           return res.status(401).send("Please login to continue.");
        }

        // verify token
        const decodedToken = await jwt.verify(token, "Tinder_GO_SECRET_KEY")
        const { id } = decodedToken;

        const user = await User.findById(id);
        if(!user) {
            res.send("user not found");
        } else {
            req.user = user;
            next();
        }
        
    } catch (error) {
        return res.send("ERROR: " + error.message)
    }
}

module.exports = userAuth;