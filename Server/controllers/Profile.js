const Profile = require("../models/Profile")
const CourseProgress = require("../models/CourseProgress")

const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")


//  HW: Explore Cron Job

//  Update Profile
exports.updateProfile = async (req, res) => {
    try{
        //  Fetch Data
        const { gender = "", dateOfBirth = "", about = "", phoneNumber = "" } = req.body;
        const userId = req.user.id;

        //  Validate Data
        // if(!gender || !phoneNumber) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Please fill all the fields"
        //     });
        // }

        //  Find Profile
        const userDetails = await User.findById(userId);
        console.log("userDetails: ", userDetails);
        const profileId = userDetails.additionalDetails;
        console.log("profileId: ", profileId);
        const updatedProfile = await Profile.findById(profileId);

        console.log("UpdatedProfile => ", updatedProfile);
        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }


        //  Update Profile
        updatedProfile.gender = gender;
        updatedProfile.dateOfBirth = dateOfBirth;
        updatedProfile.about = about;
        updatedProfile.phoneNumber = phoneNumber;
        await updatedProfile.save();

        const updatedUser = await User.findById(userId).populate("additionalDetails").exec();

        //  Return Response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } 

    catch(err) {
        console.error("Error updating profile:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


//  Delete Profile
exports.deleteProfile = async (req, res) => {
    try{
        //  Fetch Id
        const id = req.user.id;

        //  Validate 
        if(!id) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        }
        const userDetails = await User.findById(id);
        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        //  TODO: Schedule deletion after 5 days

        //  Delete Profile
        const profileId = userDetails.additionalDetails;
        const deletedProfile = await Profile.findByIdAndDelete(profileId);
        if(!deletedProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        //  TODO: UnEnroll from all Enrolled courses
        const enrolledCourses = userDetails.courses;
        await Promise.all(enrolledCourses.map( (courseId) => {
            Course.findByIdAndUpdate(courseId, 
                {
                    $pull: { studentsEnrolled: id},
                },
                {new: true},
            )
        }));

        //  Delete User
        await User.findByIdAndDelete(id);

        //  Return Response
        return res.status(200).json({
            success: true,
            message: "Profile deleted successfully"
        });
    }
    catch(err) {
        console.error("Error deleting profile:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


//  Get All User Details
exports.getAllUserDetails = async (req, res) => {
    try{
        //  Fetch User Id
        const id = req.user.id;

        //  Validate
        if(!id) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        }

        //  Find User
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        //  Return Response
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: userDetails
        });

    }
    catch(err) {
        console.error("Error fetching user details:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


//  Update Profile Picture
exports.updateDisplayPicture = async (req, res) => {
    try{
        //  Fetch Data
        const userId = req.user.id;
        const { displayPicture } = req.files;

        //  Validate Data
        if(!userId || !displayPicture) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        }

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000,
        );

        console.log(image);

    
        //  Update User
        const updatedProfile = await User.findByIdAndUpdate(userId, 
            { image: image.secure_url}, 
            {new: true}
        );

        return res.status(200).json({
            success: true,
            message: "Display picture updated successfully",
            profile: updatedProfile
        });
    }

    catch(err){
        console.error("Error in updating display picture: ", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}


exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}