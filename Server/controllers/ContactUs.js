const contactUsEmail = require("../mailTemplate/contactForm");
const mailSender = require("../utils/mailSender");

exports.contactUs = async (req, res) =>{
    try{
        //  Fetch data from request body
        const {  email, firstName, lastName, message, phoneNo, countrycode } = req.body;

        try{
            //  Send email
            const mailResponse = await mailSender(email, "Your Data Send Successfully", contactUsEmail(email, firstName, lastName, message, phoneNo, countrycode));

            console.log("Email sent successfully:", mailResponse);
            return res.status(200).json({
                success: true,
                message: "Email sent successfully"
            });
        }

        catch(err){
            console.log("Error in contactUs for sending email: ", err);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: err.message,
            });
        }
    }

    catch(err){
        console.log("Error in contactUs: ", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
}