const CourseProgess = require("../models/CourseProgess");
const SubSection = require("../models/SubSection");

exports.updateCourseProgress = async(req,res) => {
    
    const {courseId, subSectionId} = req.body;
    const userId = req.user.id ;

    try{
        //check if the subSection is valid
        const subSection = await SubSection.findById(subSectionId);

        if(!subSection) {
            return res.status(404).json({error: "Invalid SubSection"});
        }

         //check for old entry
         let courseProgess = await CourseProgess.findOne({
            courseID:courseId,
            userId:userId,
         });
         if(!courseProgess){
            return res.status(404).json({
                success: false,
                message:"Course Progress does not exist"
            });
         }
         else{
            //check for re-completing subsection
            if(courseProgess.completedVideos.includes(subSectionId)){
                return res.status(400).json({
                    errors:"SubSection already completed"
                });
            }
            //push into completed subSection
            courseProgess.completedVideos.push(subSectionId);
         }
         await courseProgess.save();

         return res.status(200).json({
            success:true,
            message:"Course Progress updated successfully",
         })
    }
    catch(error){
        console.error(error);
        return res.status(400).json({
            error:"Internal Server Error"
        })
    }
}