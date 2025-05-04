const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["interested", "ignored", "accepted", "rejected"],
            message: '{VALUE} is incorrect status type.'
        }
    }
},{timestamps: true})

// check if fromUserId and toUserId different
// get call -> connectionRequest.save()
connectionRequestSchema.pre("save", function(next) {
    const connectionRequest = this;

    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("Cannot sent request to yourself.")
    } else {
        next()
    }
})

const connectionRequestModel = new mongoose.model("connectionRequest", connectionRequestSchema)

module.exports = connectionRequestModel