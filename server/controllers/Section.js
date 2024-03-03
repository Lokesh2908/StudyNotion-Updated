const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection")

exports.createSection = async(req,res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            });
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with section objectID
		const updatedCourseDetails = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();
        //use populate to show section and subsection
        
        //return res
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourseDetails
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section, please try again",
            error:error.message
        })
    }
}

exports.updateSection = async(req,res) => {
    try{
        //data input
        const {sectionName, sectionId, courseId} = req.body;
        
        //validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName},{new:true});
        const course = await Course.findById(courseId).populate({path:"courseContent", populate:{path:"subSection"}}).exec(); 
        //return res   
        return res.status(200).json({
            success:true,
            data:course,
            message:section
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section, please try again",
            error:error.message
        });
    }
}

exports.deleteSection = async (req,res) => {
    try{
        //get section ID : assuming that we are sending ID in param
        const {sectionId, courseId} = req.body;  //params
        await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
        const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}
        //delete Id using findByIdAndDelete
        //delete sub section
        await SubSection.deleteMany({_id: {$in: section.subSection}});
        await Section.findByIdAndDelete(sectionId);
        
        //find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();
        //return res
        return res.status(200).json({
            success:true,
            data:course,
            message:"Section deleted Successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section, please try again",
            error:error.message
        });
    }
}