const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//sendOTP
exports.sendOTP = async (req, res) => {

    try{
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //if user already present then return response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }
 console.log("----------------------------------------------------");
        //generate otp
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });
        console.log("OTP generated:",otp);

        //check unqiue otp or not
        const result = await OTP.findOne({otp:otp});
        console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);
        

        while(result){
             otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email, otp};

        //create an entry for OTP
        const otpBody = await OTP.create({email:email,otp:otp});
        
        console.log("OTP Body",otpBody);

        //return response
        res.status(200).json({
            success:true,
            message:'OTPsent successfully',
            otp
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

//signup
exports.signup = async (req,res) => {
    try{
        //data fetch from req body
        const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body;

        //validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }

        //2 password match
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message: "Password and ConfirmPassword Value does not match, please try again"
            })
        }

        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is already registered"
            });
        }


        // Find the most recent OTP for the email
		const response = await OTP.find({ email:email }).sort({ createdAt: -1 }).limit(1);
		console.log(response);
		if (response.length === 0) {
			// OTP not found for the email
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		} else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}


        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

        //entry create in db
        const profileDetails = await Profile.create({gender:null, dateOfbirth:null,about:null, contactNumber:null});

        const user = await User.create({firstName, lastName, email, password:hashedPassword, accountType,approved: approved,additionalDetails:profileDetails._id, 
                                        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`});

        //return res
        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again",
        });
    }
}

//Login
exports.login = async(req,res) => {
    try{
        //get data from req body
        const {email, password} = req.body;

        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again"
            })
        }
        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"user is not generated, please signup first"
            });
        }
        //generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            });
            user.token = token;
            user.password= undefined;
        
        //create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true
        }
        res.cookie("token", token, options).status(200).json({
            success:true,
            token,
            user,
            message:"LoggedIn successfully"
        })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"LogIn failure, Please try again",
        });
    }
}


//changePassoword
//TODO:
exports.changePassword = async(req, res) => {
    try{
    //get data from body
        const {oldPassword,newPassword,confirmNewPassword} = req.body;
    //get oldPassword, newPassword, confirmNewPassword

    //validation
    const user = await User.findOne(req.user.id);
    if(!user){
        return res.status(401).json({
            success:false,
            message:"user is not generated, please signup first"
        });
    }
    // Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
        if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

        // Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}
    //update pwd in DB
    // Update password
	const encryptedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedUserDetails = await User.findByIdAndUpdate(req.user.id,{password:encryptedPassword},{new:true});
    
    
    //send mail -> password updated
    try{
        const emailResponse = await mailSender(
            updatedUserDetails.email,
            passwordUpdated(
                updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            )
        );
        console.log("Email sent successfully:", emailResponse.response);
    }
    catch(error){
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
    }
    return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
    }
    catch(error){
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
}