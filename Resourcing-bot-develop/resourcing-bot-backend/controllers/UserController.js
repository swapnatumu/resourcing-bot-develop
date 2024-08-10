import {
	User,
	JD_Details,	
	Screening_Test,

} from "../models/mongoschema.js";
import express, { response } from "express";
// const { validationResult } = require('express-validator');

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const app = express();
// Use CORS middleware
 


// Error handler function
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  };


const matchPassword = async (enteredPassword, storedPassword) => {
    return await bcrypt.compare(enteredPassword, storedPassword);
};

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};



export const register = async (req, res) => {
    try {
        const { name, email, password, phone, userType } = req.body;
      
        
        // Check if the user already exists
        let user = await User.findOne({ email });
 
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }
        if (userType === "admin") {
            const adminCount = await User.countDocuments({ userType: "admin" });
            if (adminCount >= 2) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum number of admins reached",
                });
            }
        }
        // Determine default approval status based on user type
        let approvalStatus = null;
        if (["hiringManager", "recruiter", "interviewer"].includes(userType)) {
            approvalStatus = "Pending";
        }

        // Create the user
        user = await User.create({
            name,
            email,
            password,
            phone,
            userType,
            approvalStatus,
        });

        // Log creation details
        console.log("User created:", user);
        // Retrieve admin email(s) from the database
        const adminEmails = userType === "admin" ? [email] : await getAdminEmails();
 
        console.log("Admin emails:", adminEmails);
        
        // Send admin emails to the client
        res.status(200).json({ success: true, user, adminEmails });
        
    } catch (error) {
        handleError(res, error);
    }
}


async function getAdminEmails() {
    try {
        const adminUsers = await User.find({ userType: "admin" }).select("email");
        const adminEmails = adminUsers.map(admin => admin.email);
        return adminEmails;
    } catch (error) {
        console.error("Error retrieving admin emails:", error);
        return []; 
    }
}


const getJobDetailsByUserType = async (user, userType) => {
    let filter = {};
    let populateOptions = [];

    switch (userType) {
        case "recruiter":
            filter = { recruiterContacts: { $elemMatch: { $eq: user._id } }, is_active: true };
            populateOptions = [{ path: "recruiterContacts", match: { email: user.email } }];
            break;

        case "interviewer":
            filter = { interviewerContacts: { $elemMatch: { $eq: user._id } }, is_active: true };
            populateOptions = [{ path: "interviewerContacts", match: { email: user.email } }];
            break;

        case "hiringManager":
            filter = { hiringManager: user._id };
            break;

        default:
            throw new Error("Invalid user type");
    }

    // Add common populate options for all user types
    populateOptions.push(
        { path: "hiringManager", select: "email" },
        { path: "recruiterContacts", select: "email" },
        { path: "interviewerContacts", select: "email" }
    );

    let query = JD_Details.find(filter);
    populateOptions.forEach(option => {
        query = query.populate(option);
    });

    return await query.exec();
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("In login email:: ", email);

        // Query the database to find the user with the provided email
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).send("User with provided email not found.");
        }

        console.log("User found");

        // Check if the password matches
        const passwordMatch = await matchPassword(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send("Incorrect password. Please try again.");
        }

        console.log("Password matched");

        // Generate token
        const token = generateToken(user._id);

     

        // Check if the user is an admin
        if (user.userType === 'admin') {
            console.log("Admin found");
            const users = await User.aggregate([
                {
                    $match: {
                        userType: { $ne: 'admin' }  // Exclude admin users
                    }
                },
                {
                    $group: {
                        _id: '$Approval_status',
                        users: { $push: '$$ROOT' }
                    }
                }
            ]);
    
            // Restructure the result into separate arrays
            const pendingUsers = users.find(group => group._id === 'Pending')?.users || [];
            const approvedUsers = users.find(group => group._id === 'approved')?.users || [];
            const rejectedUsers = users.find(group => group._id === 'rejected')?.users || [];

            return res.json({
                token,
                user,                
                pendingUsers, approvedUsers, rejectedUsers
            });
        }

        // Check if the user is approved
        if (user.Approval_status !== 'approved') {
            return res.status(401).send("You are not approved. Please contact the admin for approval.");
        }

        console.log("User is approved");

        // Get job details by user type
        try {
            const jds = await getJobDetailsByUserType(user, user.userType);

            // Fetch Screening IDs for each JD
            const screeningIDs = {};
            if (user.userType === 'recruiter') {
                for (let jd of jds) {
                    const screeningTest = await Screening_Test.findOne({ jd: jd._id }).exec();
                    if (screeningTest) {
                        screeningIDs[jd._id] = screeningTest.ScreeningID;
                    } else {
                        screeningIDs[jd._id] = null; // Handle case where no screening test is found
                    }
                }
            }
            
            return res.json({ token, user, jds:jds, userType: user.userType ,screeningIDs });
        } catch (error) {
            return res.status(400).send(error.message);
        }

    } catch (error) {
        handleError(res, error);
    }
};

//  admin profile my profile data change 
// Update User Profile
export const updateProfile = async (req, res) => {
    const { email, name, phone } = req.body;

    console.log('Updating profile');
    try {
        const user = await User.findOneAndUpdate(
            { email },
            { name, phone },
            { new: true } 
        );

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ user });
    } catch (error) {
        handleError(res, error);
    }
};


//  admin profile my profile password change 
// Change Password
export const changePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the old password matches
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect old password." });
        }

        // Update the password
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully." });
    } catch (error) {
        handleError(res, error);
    }
};


export const getRecruitersAndInterviewers = async (req, res) => {
	try {
		// Fetch recruiters and interviewers from the database
		const recruiters = await User.find({ userType: "recruiter" }).select(
			"email "
		);
		const interviewers = await User.find({ userType: "interviewer" }).select(
			"email "
		);

		res.status(200).json({
			success: true,
			recruiters,
			interviewers,
		});
	} catch (error) {
        handleError(res, error);
	}
};





export const socialmedialogin = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            res.json({ success: true, userType: user.userType });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        handleError(res, error);
    }
};

// Route to request OTP for password reset
export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
  
      // Save the OTP to the user document
      user.otp = otp;
      await user.save();
  
      res.status(200).json({ success: true, message: "OTP sent successfully.", otp });
    } catch (error) {
        handleError(res, error);
    }
  };
  

// Route to verify OTP and reset password
export const resetPassword = async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      // Verify OTP
      const parsedOTP = otp.toString();
        if (user.otp !== parsedOTP) {
        return res.status(400).json({ success: false, message: "Invalid OTP." });
        }
  
      // Reset password
      user.password = newPassword;
      user.otp = null;
      await user.save();
  
      res.status(200).json({ success: true, message: "Password reset successfully." });
    } catch (error) {
        handleError(res, error);
    }
  };



const addToBlacklist = (token) => {
    console.log(`Token added to blacklist: ${token}`);
};

export const logout = (req, res) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization header:', authHeader);  

    const token = authHeader?.split(' ')[1];
    if (token) {
        console.log('Logout token:', token); 
        addToBlacklist(token); 
        res.send({ message: 'Logged out successfully' });
    } else {
        res.status(400).send({ message: 'No token provided' });
    }
};
