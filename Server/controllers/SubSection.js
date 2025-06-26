const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const { uploadImageToCloudinary } = require('../utils/imageUploader');


//  Create SubSection
exports.createSubSection = async (req, res) => {
    try{
        //  Fetch Data
        const { title, description, sectionId } = req.body;

        const video = req.files.video;

        //  Validate Data
        if(!title || !description || !sectionId || !video) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }


        //  Upload Video to Cloudinary
        const updateDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);


        //  Create a new SubSection
        const newSubSection = await SubSection.create({
            title: title,
            description: description,
            videoUrl: updateDetails.secure_url, //  Store the secure URL of the uploaded video
        });


        // Update Section with new SubSection
        const updatedSection = await Section.findByIdAndUpdate(sectionId, 
            {
                $push: { subSection: newSubSection._id }
            },
            {new: true}
        ).populate('subSection');

        console.log("Updated Section with new SubSection: ", updatedSection);


        //  Return Response
        console.log("New SubSection Created: ", newSubSection);
        return res.status(201).json({
            success: true,
            message: "SubSection created successfully",
            data: updatedSection,
        });
    }

    catch(err) {
        console.error("Error creating subsection:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


//  Update SubSection
exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}


//  Delete SubSection
exports.deleteSubSection = async (req, res) => {
    try{
        //  Fetch Data
        const { subSectionId, sectionId } = req.body;

        //  Validate Data
        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        //  Delete SubSection
        await SubSection.findByIdAndDelete(subSectionId);

        //  Remove SubSection from Section
        await Section.findByIdAndUpdate(sectionId, 
            {
                $pull: { subSection: subSectionId }
            },
            { new: true }
        );

        const updatedSection = await Section.findById(sectionId).populate('subSection');

        //  Return Response
        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection
        });
    }

    catch(err) {
        console.error("Error deleting subsection:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}