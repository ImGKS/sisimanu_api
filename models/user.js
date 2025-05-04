const mongoose = require('mongoose');
const validator = require('validator')

// Schema of user -> describe properties of user collection document
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error ("Invalid Email.")
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error ("IPlease set strong password.")
            }
        }
    },
    age: {
        type: Number,
        required: true,
    },
    profilePic: {
        type: String,
        default: "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg",
        set: function (value) {
            if (value === "") {
              return "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg";
            }
            return value;
        }
    },
    gender: {
        type: String,
        required: true,
        validate(value) {
            if (!["male", "female"].includes(value)) {
                throw new Error("Gender invalid.")
            }
        }
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    paymentSessionId: {
        type: String,
    },
    subscriptionId: {
        type: String,
    },
    premiumType: {
        type: String,
    },
    premiumStart: {
        type: String,
    },
    premiumExpires: {
        type: String,
    },
    about: {
        type: String
    },
},{
    timestamps: true
})

// model
const User = mongoose.model("User", userSchema)


module.exports = User