const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailsender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");
const { default: mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgess = require("../models/CourseProgess");

//initiate the razorpay order
exports.capturePayment = async(req,res) => {

    const {courses} = req.body;
//    const coursesArray = Object.values(courses);
    const userId = req.user.id;

    if(courses.length === 0){
        return res.json({success:false, message:"Please provide Course Id"});
    }

    let totalAmount = 0;

    for(const course_id of courses){
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course) {
                return res.status(200).json({success:false, message:"Could not find the course"});
            }

            const  uid = new mongoose.Types.ObjectId(userId);
            if(course.studentEnrolled.includes(uid)){
                return res.status(200).json({success:false, message:"Student is already Enrolled"});
            }

            totalAmount += course.price; 
        }
        catch(error){
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }

    const options = {
        amount: totalAmount * 100,
        currency:"INR",
        receipt: Math.random(Date.now()).toString()
    }

    try{
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success:true,
            message:paymentResponse
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Could not Initiate order"
        })
    }
}

//verify the payment
exports.verifyPayments = async(req,res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId){
        return res.status(200).json({success:false,message:"Payment failed"});
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");
    
    if(expectedSignature === razorpay_signature){
       //enroll the student
        await enrollStudents(courses, userId, res);

       //return response
        return res.status(200).json({success:true, message:"Payment Verified"});
    }
    return res.status(200).json({success:false, message:"payment Failed"});
}

const enrollStudents = async(courses, userId, res) => {

    if(!courses || !userId) {
        return res.status(400).json({success:false, message:"Please Provide data for Courses or userId"});
    }

    for(const courseId of courses){
        try{
                    //find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
            {_id:courseId},
            {$push:{studentEnrolled:userId}},
            {new:true}
        )

    if(!enrolledCourse){
        return res.status(500).json({sucsess:false,message:"Course not found"});
    }
    
    const courseProgess = await CourseProgess.create({
        courseID:courseId,
        userId:userId,
        completedVideos:[]
    })
    //find the student and add the course to their list of enrolledCourses
    const enrolledStudent = await User.findByIdAndUpdate(userId,
        {$push:{
            courses: courseId,
            courseProgress: courseProgess._id
        }},
        {new:true}
        )
        //send mail to student
        const emailResponse = await mailSender(
            enrolledStudent.email,
             `Successfully Enrolled into ${enrolledCourse.courseName}`,
             courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
        )
        console.log("Email Sent Successfully", emailResponse.response);
        }
        catch(error){
         console.log(error);
         return res.status(500).json({success:false, message:error.message});   
        }
    }
}

exports.sendPaymentSuccessEmail = async(req,res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId){
        return res.status(400).json({success:false, message:"Please provide all the fields"});
    }

    try{
        //findout student
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
            paymentSuccessEmail(`${enrolledStudent.firstName}`,amount/100, orderId, paymentId)    
            );
    }
    catch(error){
        console.log("error in sending mail", error);
        return res.status(500).json({success:false, message:"Could not send mail"})
    }
}

//capture the payment and initiate the Razorpay order
// exports.capturePayment = async(req,res) => {
    
//         //get courseid and UserId
//         const {course_id} = req.body;
//         const userId = req.user.id;

//         //validation
//         //valid courseId
//         if(!course_id){
//             return res.json({
//                 success:false,
//                 message:'Please provide valid course ID'
//             });
//         }
        
//         //valid courseDetail
//         let course;
//         try{
//             course = await Course.findById(course_id);
//             if(!course){
//                 return res.json({
//                     success:false,
//                     message:'could not find the course'
//                 });
//             }
//             //user already pay for the same course
//             const uid = new mongoose.Types.ObjectId(userId);
//             if(course.studentEnrolled.includes(uid)){
//                 return res.status(200).json({
//                     success:false,
//                     message:'Student is already enrolled'
//                 });
//             }
//         }
//         catch(error){
//             console.log(error)
//             return res.status(500).json({
//                 success:false,
//                 message:error.message
//             });
//         }
        
//         //order create
//         const amount = course.price;
//         const currency = "INR";

//         const options = {
//             amount: amount * 100,
//             currency,
//             receipt:Math.random(Date.now()).toString(),
//             //here, why we make notes will be cleared from line 119
//             notes:{   
//                 courseId: course_id,
//                 userId
//             }
//         };

//         try{
//             //initiate payment using razorpay
//             const paymentResponse = await instance.orders.create(options);
//             console.log(paymentResponse);
//             //return res
//             return res.status(200).json({
//                 success:true,
//                 courseName:course.courseName,
//                 courseDescription:course.courseDescription,
//                 thumbnail:course.thumbnail,
//                 orderId:paymentResponse.idd,
//                 currency:paymentResponse.currency,
//                 amount:paymentResponse.amount

//             });
//         }
//         catch(error){
//             console.log(error);
//             res.json({
//                 sucess:false,
//                 message: "Could not initiate order"
//             })   
//         }

// }

// //verify Signature

// exports.verifySignature = async(req,res) =>{

//     const webhookSecret = "12345678";

//     const signature = req.headers("x-razorpay-signature");   //razorpay will send secret key in hashed format
//     //we cant decrypt hashed form
//     //HW->checksum

//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     //convert into string
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature == digest){
//         console.log("Payment is Authorised");
//         //now we have to enroll the student into course & for that we need userdId and coursID
//         //but here the req is coming from razorpay so we cant cant have the userId and courseID form req.body
//         //thats why we make notes deliberatley in line 60 where we stored courseId and notesId
//         //So to get the ID here is the way to findout : req.body.payload.payment.entity.notes
//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try{
//             //Validation is not required because we already verified it in capturePayment
//             //Action
//             // find the course & Enroll student in course
//             const enrolledCourse = await Course.findOneAndUpdate({_id:courseId},{$push:{studentEnrolled:userId}},{new:true});

//             if(!enrolledCourse){
//                 return res.status(500).json({
//                     success:true,
//                     message:'Course not found'
//                 });

//                 console.log(enrolledCourse);

//                 //find user and add the course to their list enrolled courses
//                 const enrolledStduent = await User.findOneAndUpdate({_id:userId},{$push:{courses:courseId}},{new:true});

//                 console.log(enrolledStduent);
//                 //now send the mail that user is registered to course

//                 const emailResponse = await mailsender(enrolledStduent.email, "Congratulations from Codehelp" ,"Congratulation, you are onboarded into new Codehelp Course");
//                 console.log(emailResponse);
//                 return res.status(200).json({
//                     success:true,
//                     message:"signature verified and Course Added"
//                 });
//             }
//         }
//         catch(error){
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message
//             });
//         }
//     }
//     else{
//         return res.status(400).json({
//             success:false,
//             message:"Invalid request"
//         })
//     }
// }