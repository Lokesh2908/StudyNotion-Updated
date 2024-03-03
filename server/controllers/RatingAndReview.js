
const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//createRating
exports.createRating = async(req,res) => {
    try{
        //get userId
        const userId = req.user.id;
        //fetch data from req.body
        const {rating, review, courseId} = req.body;       
        //check user is enrolled or not
        const courseDetails = await Course.findOne({_id:courseId, studentEnrolled: {$elemMatch: {$eq: userId}},});

        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"Student is not enrolled in the course"
            })
        }

        //check if user is already reviewed the course or not
        const alreadyReviewed = await RatingAndReview.findOne({user:userId, course:courseId,});

        if(alreadyReviewed){
            return res.status(403).json({
                success:true,
                message:"Course is alredy reviewed by the user" 
            })
        }
        //if not, them create rating and review
        const ratingReview = await RatingAndReview.create({rating,review,course:courseId,user:userId});
        //now add review rating to the course and update the course
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId}, 
                                        {
                                            $push: {
                                                ratingAndReviews:ratingReview._id,
                                            }

                                        },
                                        {new:true});
        console.log(updatedCourseDetails);
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfullly",
            ratingReview
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}


//getAveragerating
exports.getAverageRating = async(req,res)=>{
    try{
        //get CourseId
        const courseId = req.body.courseId;
        //calculate Average Rating;
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    //here we are using this "new mongoose.Types.ObjectId" because courseId is inn Strring format & we are converting it into objectId
                    course: new mongoose.Types.ObjectId(courseId),
                },    
            },
            {
                $group: {
                    _id:null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ]);
        //return rating
        if(result.length > 0) {
            return res.status(200).json({
                success:true,
                AverageRating: result[0].averageRating
            })
        }
        //if no rating exist
        return res.status(200).json({
            success:true,
            message:'Average rating is 0, noo rating is given till now',
            AverageRating:0
        })
        //return resting
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
}

}


//getAllRating irrespective of course
exports.getAllRatingAndReviews = async(req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                    .sort({rating:"desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select:"courseName"
                                    })
                                    .exec();
        return res.status(200).json({
            success:true,
            messsage:"All reviews fetched successfully",
            data:allReviews
        })                            
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

//HW -> handler for courseID based RatingAndReviews
exports.getRatingAndReviews = async(req, res) => {
    try{
         //get CourseId
        const courseId = req.body.courseId;
        const allReviews = await RatingAndReview.find({course:courseId})
                                    .sort({rating:"desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select:"courseName"
                                    })
                                    .exec();
        return res.status(200).json({
            success:true,
            messsage:"All reviews fetched successfully",
            data:allReviews
        })                            
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}