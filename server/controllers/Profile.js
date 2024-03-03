const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const {uploadImageCloudinary} = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const CourseProgess = require("../models/CourseProgess");
const mongoose = require("mongoose")

exports.updateProfile = async(req,res) => {
    try{
        //get data
        const {dateOfBirth="",about="",contactNumber, gender} = req.body;
        
        //userId
        const id = req.user.id;
        
        //validation
        if(!contactNumber || !gender){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        //find profile
        const userDetails = await User.findById(id);
        const ProfileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(ProfileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();
        //return res
        return res.status(200).json({
            success:true,
            message:"Profile Updated Successfully",
            profileDetails 
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message
        });
    }
}

//deleteAccount
//explore -> how can we schedule this delete operation
exports.deleteAccount = async(req,res) => {
    try{
        //get Id
        const id = req.user.id;
        //validation id
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:'User not found'
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //delete user
        await User.findByIdAndDelete({_id:id});
        
        // UnstudentEnrolled from course
        const updatedCourseDetails = await Course.findByIdAndDelete({_id:userDetails.id});
        //delete user
        const UpdatedUser = await User.findByIdAndDelete({_id:id});
        //return res
        return res.status(200).json({
            success:true,
            message:"User deleted Successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message
        });
    }
}

exports.getAllUserDetails = async(req,res) =>{
    try{
        const id = req.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success:true,
            message:"User data fetched Successfully",
            userDetails
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    const userDetails = await User.findOne({
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
      console.log("156");
    //  console.log("user detials", userDetails);
      const userDetail = userDetails.toObject();
      console.log("In Object form", userDetail)
      console.log("159")
    var SubsectionLength = 0
    for (var i = 0; i < userDetail.courses.length; i++) {
      console.log("inside loop");
      let totalDurationInSeconds = 0 ;
      SubsectionLength = 0 ;
      for (var j = 0; j < userDetail.courses[i].courseContent.length; j++) {
        console.log("inside nested loop");
        totalDurationInSeconds += userDetail.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetail.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
        userDetail.courses[i].courseContent[j].subSection.length
      }
      console.log("outside nested loop");
      let courseProgressCount = await CourseProgess.findOne({
        courseID: userDetail.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetail.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetail.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }
    console.log("outside 1st loop")
    if (!userDetail) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetail}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetail.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

exports.instructorDashboard = async(req,res) =>{

  try{
      const courseDetails = await Course.find({instructor: req.user.id});

      const courseData = courseDetails.map((course)=> {
        const totalStudentsEnrolled = course.studentEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price

        //create a new object with the additional fields
        const courseDatawithStats = {
           _id:course._id,
           courseName: course.courseName,
           courseDescription: course.courseDescription,
           totalStudentsEnrolled,
           totalAmountGenerated
        }
        return courseDatawithStats;
      })
      console.log('instructorDashboard', courseData);
      res.status(200).json({
        courses:courseData
      })
  }
  catch(error){
    console.log(error);
    res.status(500).json({
      message:"Internal Server Error"
    })
  }
}
