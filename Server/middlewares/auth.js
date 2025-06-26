const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();


// auth
exports.auth = async (req, res, next) => {
    try {
        //  Extract token from cookies
        const token =
            req.cookies?.token ||
            req.body?.token ||
            (req.header("Authorization")?.replace("Bearer ", ""));

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing"
            });
        }

        //  Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Token:", decoded);

            req.user = decoded;  //  Attach user info to request object

        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        next();  //  Proceed to next middleware or route handler

    }

    catch (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while authenticating user"
        });
    }
}


//  isStudent
exports.isStudent = (req, res, next) => {
    try {
        const user = req.user;  //  User info from auth middleware
        console.log("User Info in isStudent Middleware:", user);

        if (!user || user.accountType !== "Student") {
            return res.status(403).json({
                success: false,
                message: "Access denied, You are not a student"
            });
        }

        next();
    }

    catch (err) {
        console.error("Error in isStudent middleware:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while checking student role"
        });
    }
}


//  isInstructor
exports.isInstructor = (req, res, next) => {
    try {
        const user = req.user;  //  User info from auth middleware
        console.log("User Info in isInstructor Middleware:", user);

        if (!user || user.accountType !== "Instructor") {
            return res.status(403).json({
                success: false,
                message: "Access denied, You are not a Instructor"
            });
        }

        next();
    }

    catch (err) {
        console.error("Error in isInstructor middleware:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while checking instructor role"
        });
    }
}


// isAdmin
exports.isAdmin = (req, res, next) => {
    try {
        const user = req.user;  //  User info from auth middleware
        console.log("User Info in isAdmin Middleware:", user);

        if (!user || user.accountType !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied, You are not a Admin"
            });
        }

        next();
    }

    catch (err) {
        console.error("Error in isAdmin middleware:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while checking Admin role"
        });
    }
}


