const mongoose = require("mongoose");
const { type } = require("os");

const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
    },

    dateOfBirth: {
        type: String,
    },

    about: {
        type: String,
        trim: true
    },

    phoneNumber: {
        type: String,
        trim: true,
    }
});

module.exports = mongoose.model("Profile", profileSchema);