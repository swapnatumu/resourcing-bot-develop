import {
	User,
	
} from "../models/mongoschema.js";

import express, { response } from "express";




const app = express();




// Error handler function
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({                                                                                              
      success: false,
      message: 'Internal Server Error',
    });
};
export const approveUser = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("email", email);
        const user = await User.findOneAndUpdate(
            { email, Approval_status: { $in: ['Pending', 'rejected'] } },  // Query condition
            { Approval_status: 'approved' },  // Update
            { new: true }  // Return updated document
          );
          
          if (!user) {
            return res.status(400).json({ success: false, message: 'User is not in Pending or Rejected state to approve' });
          }
          
          const { pendingUsers, approvedUsers, rejectedUsers } = await getUsers();

         return res.status(200).json({
             success: true,
             message: 'User approval status changed from rejected/Pending to approved',
             pendingUsers,
             approvedUsers,
             rejectedUsers
         }); 
        
    } catch (error) {
        handleError(res, error);
    }
};

export const rejectUser = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("email", email);

        // Update the approval_status field to "rejected"
        const user = await User.findOneAndUpdate(
            { email },
            { Approval_status: 'rejected' },
            { new: true }  // Return updated document
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { pendingUsers, approvedUsers, rejectedUsers } = await getUsers();

        return res.status(200).json({
            success: true,
            message: 'User rejected successfully',
            pendingUsers,
            approvedUsers,
            rejectedUsers
        });

       
    } catch (error) {
        handleError(res, error);
    }
};




const getUsers = async (req, res) => {
    try {
        // Fetch users grouped by Approval_status
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

        return {pendingUsers, approvedUsers, rejectedUsers }; 
        
    } catch (error) {
        console.error("Error fetching users:", error);
        handleError(res, error);
    }
};




  