//const user = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const crypto = require("crypto");

//resetPasswordToken
exports.resetPasswordToken = async(req,res) => {

    try{
        //get email form req body
        const email = req.body.email;
        //check user for this email, email validation
        const user = await User.findOneAndUpdate({email:email});
        if(!user){
            return res.json({
                success:false,
                message:"Your email is not registred with us"
            });
        }

        //generate token
        const token = crypto.randomBytes(20).toString("hex");
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email:email},{token:token,resetPasswordExpires:Date.now() + 5*60*1000},{new:true});
        console.log("DETAILS", updatedDetails);
        //create url
        const url = `http://localhost:3000/update-password/${token}`;
        //send email containing url
        await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);
        //return response
        return res.json({
            success:true,
            message:'Email sent Successfully, Please check Email to reset password'
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while reset pwd mail'
        })
    }
}

//resetPassword
exports.resetPassword = async(req,res) => {
    try{
        //data fetch
        const {password, confirmPassword, token} = req.body;
        //validation
        if(password!== confirmPassword){
            return res.json({
                success:false,
                message:"Password not matching"
            });
        }
        //get userdetails form db using token
        const userDetails = await User.findOne({token:token});
        //if no entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"token is invalid"
            })
    }
        //token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"Token is expired, Please regenerate token"
            })
        }
        //hash pwd
        const hashedPassword = await bcrypt.hash(password, 10);
        //update password in db

        await User.findOneAndUpdate({token:token},{password:hashedPassword},{new:true});
        //reyurn response
        return res.status(200).json({
            success:true,
            message:"password reset Ssuccesfully"
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while reset ped mail'
        })
    }
}