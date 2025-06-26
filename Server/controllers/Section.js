const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require('../models/SubSection');


//  Create Section
exports.createSection = async (req, res) => {
    try{
        //  Fetch Data
        const { sectionName, courseId } = req.body;


        //  Validate Data
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        
        //  Check if Course exists
        const courseDetails = await Course.findById(courseId);
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }


        //  Create a new Section
        const newSection = await Section.create({
            sectionName: sectionName,
            subSection: [], 
        });


        //  Update course with new section
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $push: { courseContent: newSection._id } },
            { new: true },
        ).populate({
            path: 'courseContent',
            populate: {
                path: 'subSection',
            },
        }).exec();
        console.log("New Section Created: ", newSection);
        console.log("Updated Course with new section: ", updatedCourse);

        //  TODO:  use populate to replace section/subSection IDs with actual data

        //  Return Response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourse,
        });
    }

    catch(err) {
        console.error("Error creating section:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


//  Update Section
exports.updateSection = async (req, res) => {
    try{
        // Fetch Data
        const { sectionName, sectionId, courseId } = req.body;
        console.log("sectionName: ", sectionName);

        // Validate Data
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Section name is required"
            });
        }

        //  Update Section
        const newSectionDetails = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});
        console.log("Updated Section: ", newSectionDetails);

        const courseDetails = await Course.findById(courseId).populate({
            path: 'courseContent',
            populate: {
                path: 'subSection',
            }
        });

        //  Return Response
        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            data: courseDetails,
        });
    }

    catch(err) {
        console.error("Error updating section:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


//  Delete Section
exports.deleteSection = async (req, res) => {
    try{
        //  Fetch Id - Assuming we are sending Id in params
        const { sectionId, courseId } = req.body;

        const section = await Section.findById(sectionId);


        //  Validate Data
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: "Section ID is required"
            });
        }

        //  Delete Subsections associated with this section
        await SubSection.deleteMany({ _id: {$in: section.subSection} });

        //  Delete Section
        await Section.findByIdAndDelete(sectionId);

        //  TODO [Testing] :  Do we need to remove this section from the course as well?

        const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

        //  Return Response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            data: course,
        });
    }

    catch(err) {
        console.error("Error deleting section:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}