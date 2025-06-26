const User = require('../models/User');
const Otp = require('../models/Otp');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken'); 
const cookieParser = require('cookie-parser');
const mailSender = require('../utils/mailSender');
const passwordUpdated = require('../mail/template/passwordUpdate');


//  SendOtp
exports.sendOtp = async (req, res) => {

    try{
        //  Fetch email from request body
        const { email } = req.body;

        //  Check user exists
        const checkUserPresent = await User.findOne({ email });

        //  If user exists, return error
        if (checkUserPresent) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
        }   

        //  Generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true
        });

        console.log("Generated OTP:", otp);

        // Check unique OTP or Not
        var checkOtp = await Otp.findOne({ otp });

        while(checkOtp){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
                digits: true
            });
            checkOtp = await Otp.findOne({ otp });
        }

        const otpPayload = {
            email,
            otp
        };

        //  Save OTP in database
        const otpBody = await Otp.create(otpPayload);   
        console.log("OTP saved in database:", otpBody);

        //  Return response
        return res.status(200).json({ 
            success: true,
            message: 'OTP sent successfully',
            otp,
        });
    }

    catch(err){
        console.log("Error in sendOtp:", err);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

//  Signup
exports.signUp = async (req, res) => {
    try{

        //  fetch data from request body
        const { firstName, lastName, email, password, confirmPassword, accountType, otp, additionalDetails, image } = req.body;


        // Validate karo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType){
            console.log("Error: Please fill all the fields");
            return res.status(403).json({ 
                success: false,
                message: 'Please fill all the fields' 
            });
        }
        

        //  2 passwords match ho rahe hai ya nahi
        if(password !== confirmPassword){
            return res.status(400).json({ 
                success: false,
                message: 'Passwords do not match Please try again' 
            });
        }


        //  Check user already exists or not
        const checkUserPresent = await User.findOne({ email});
        if(checkUserPresent){
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
        }


        //  find most recent otp for user
        const recentOtp = await Otp.findOne({ email: email }).sort({ createdAt: -1 }).limit(1); // limit(1) ensures we get the most recent OTP
        

        //  validate otp
        if(!recentOtp){
            return res.status(400).json({ 
                success: false,
                message: 'No OTP found for this email' 
            });
        }
        console.log("Recent OTP:", recentOtp);

        if(recentOtp.otp !== otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }


        //  hash password
        const hashPassword = await bcrypt.hash(password, 10);


        //  Create user 

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            phoneNumber: null,
            about: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            accountType,
            password: hashPassword,
            accountType,
            additionalDetails : profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //  Return response
        return res.status(200).json({
            success: true,
            message: "User created successfully",
        });
    }

    catch(err){
        console.log("Error in signUp:", err);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error, User Cannot be registered. Please try again', 
        });
    }
}


// Login
exports.login = async (req, res) => {
    
    try{
        //  Fetch Email and Password from req body
        const { email, password } = req.body;


        // Validate
        if(!email || !password){
            return res.status(400).json({ 
                success: false,
                message: 'Please fill all the fields' 
            });
        }


        //  Check User Exist or Not
        const user = await User.findOne({ email }).populate("additionalDetails");

        if(!user){
            return res.status(400).json({
                success: false,
                message: "User does not exist, Please try with Another Email",
            });
        }

        
        //  Check password Match or Not
        const dbPassword = user.password;
        const isMatch = await bcrypt.compare(password, dbPassword);  //  compare (plainPassword, HashedPassword)

        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Wrong Password, Try again",
            })
        }

        //  Generate JWT
        const payload = {
            id: user._id,
            email: user.email,
            accountType: user.accountType,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '30d'  //  Token will expire in 1 day
        }); 

        user.token = token;  //  Add token to user object
        user.password = undefined;  //  Remove password from user object


        //  Create Cookie and return response
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //  Cookie will expire in 30 days
            httpOnly: true, //  Cookie cannot be accessed by client-side scripts
        };

        res.cookie('token', token, options).status(200).json({
            success: true,
            message: "Login Successful",
            user,
            token,
        }); 
    }
    
    catch(err){
        console.log("Error in login", err);
        return res.status(500).json({
            success: false,
            message: "Error in Login",
        });
    }
}


//  Change Password
exports.changePassword = async (req, res) => {
    
    try{
        //  Fetch data from request body
        const { oldPassword, newPassword } = req.body;

        //  Get oldPassword, newPassword 


        //  Validate
        if(!oldPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields",
            });
        }

        // if(newPassword !== confirmNewPassword){
        //     return res.status(400).json({
        //         success: false,
        //         message: "New Password and Confirm New Password do not match",
        //     });
        // }

        const userId = req.user.id;
        const user = await User.findById(userId); 
        
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);  //  compare (plainPassword, HashedPassword)
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Old Password is incorrect, Please try again",
            });
        }

        
        //  Update Password in DB
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(userId, { 
            password: hashedNewPassword 
            }, 
            { new: true }
        );


        //  send Mail - password Updated
        const email = user.email;
        
        let mailResponse;
        try{
            const name = user.firstName + " " + user.lastName;
            mailResponse = await mailSender(email, "Password Changed Successfully", passwordUpdated(email, user.firstName, name));
            console.log("Mail sent successfully: ", mailResponse);
        }

        catch(error) {
            console.log("Error in sending mail:", error);
            return res.status(500).json({
                success: false,
                message: "Password changed, but failed to send email notification",
            });
        }


        // Return response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
            mailResponse: mailResponse,
        });
    }

    catch(err){
        console.log("Error in changePassword: ", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error, Password cannot be changed",
        });
    }
}