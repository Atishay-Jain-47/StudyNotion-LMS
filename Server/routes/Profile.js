const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middlewares/auth")
const {
    updateProfile,
    deleteProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard,
} = require("../controllers/Profile")

const { resetPasswordToken, resetPassword } = require("../controllers/ResetPassword")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// Delet User Account
router.delete("/deleteProfile", auth, deleteProfile)
router.put("/updateProfile", auth, (req, res, next) => {
  console.log("updateProfile route hit");
  next();
}, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

router.post('/resetPasswordToken', resetPasswordToken);
router.post('/resetPassword', resetPassword);

module.exports = router