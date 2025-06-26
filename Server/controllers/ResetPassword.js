const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');


//  resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        //  Fetch email from request body
        const { email } = req.body;

        //  Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        //  Generate reset password token
        const token = crypto.randomUUID();

        //  Save token in user document
        const updatedDetails = await User.findOneAndUpdate({ email }, 
            {
                token,
                resetPasswordExpiry: Date.now() + 5 * 60 * 1000  // Token valid for 5 minutes
            },
            { new: true },
        );


        //  Create url
        const url = `localhost:3000/update-password/${token}`;

        //  Send Mail containing the url
        await mailSender(email, 'Reset Password Link', `Click the link to reset your password: ${url}`);

        //  Return success response
        return res.status(200).json({
            success: true,
            message: 'Reset password link sent to your email'
        });

    } catch (error) {
        console.error("Error in resetPasswordToken:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while resetting password',
        });
    }
};


//  resetPassword
exports.resetPassword = async (req, res) => {
    try {
        //  Fetch token and new password from request body
        const { token, password, confirmPassword } = req.body;

        //  Check if token is valid (Validation)

        if( !token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token, password and confirm password are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        //  Fetch user by token
        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        if(user.resetPasswordExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Token has expired'
            });
        }

        //  Hash the new password 
        const hashedPassword = await bcrypt.hash(password, 10);


        //  Update user's password
        await User.findOneAndUpdate({ token: token },
            {
                password: hashedPassword,
                token: token,
            },
            { new: true }
        );

        //  Return success response
        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while resetting password',
        });
    }
};