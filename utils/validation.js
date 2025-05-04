const validator = require('validator');
const { ALLOWED_UPDATE_FIELDS } = require('./constants');

const validateSignupData = (req) => {
    const { firstName, lastName, age, emailId, password, profilePic, gender, skills } = req.body;

    if(!firstName || !lastName) {
        throw new Error("Name not valid.")
    } else if(!validator.isEmail(emailId)) {
        throw new Error("EmailId invalid.")
    } else if(!validator.isStrongPassword(password)) {
        throw new Error("Need a strong password.")
    } else if(skills?.length > 5) {
        throw new Error('Skills can have maximum 5.')
    }
}


const validateEditProfileData = (req) => {
    const isUpdateAllowed = Object.keys(req.body).every((key)=>ALLOWED_UPDATE_FIELDS.includes(key));
    return isUpdateAllowed
}

module.exports = {validateSignupData, validateEditProfileData}