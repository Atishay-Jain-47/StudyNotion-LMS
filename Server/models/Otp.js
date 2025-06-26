const mongoose = require("mongoose");
const mailSender = require('../utils/mailSender');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },

    otp: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: '10m' // OTP will expire after 10 minutes
    }
});


//  A function to send mail

async function sendVerificationEmail(email, otp) {
    try {
        const mailResposne = await mailSender(email, "Verification Email from StudyNotion", otp);
        console.log("Email sent successfully:", mailResposne);
    } 
    
    catch (error) {
        console.log("Error in sendMail:", error);
        throw new Error("Failed to send verification email");
    }
}

otpSchema.pre('save', async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
});

module.exports = mongoose.model("Otp", otpSchema);