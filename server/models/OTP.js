const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");


const OTPSchema = new mongoose.Schema({
    email: {
        type:String,
        required:true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
        type:Date,
        default:Date.now(),
        expires: 10*60,
    }
});

//function to send mail
async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email, "Verification email from StudyNotion", emailTemplate(otp)); //(emailId, title, body)
        console.log("Email sent Successfully:", mailResponse.response);
    }
    catch(error){
        console.log("error occured while sending mail:",error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next) {
    
    console.log("New document saved to database");
    // Only send an email when a new document is created
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

module.exports = mongoose.model("OTP", OTPSchema);