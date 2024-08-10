import {
	User,
	JD_Details,
	Candidate_Profiles,
	Screening_Test,
	Interviews,

} from "../models/mongoschema.js";
import express, { response } from "express";

import mongoose from 'mongoose';

const app = express();



// Error handler function
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  };
// Function to find existing users by emails and return their IDs
const findExistingUsers = async (emails) => {
    const userIDs = await Promise.all(
        emails.map(async (email) => {
            const existingUser = await User.findOne({ email });
            return existingUser ? existingUser._id : null;
        })
    );
    return userIDs.filter(id => id !== null); // Remove null values (users not found)
};

export const createJobDescription = async (req, res) => {
	try {
		const {
			companyName,
			jobDescription,
			jobRole,
			skills,
            secondarySkills,
			experience,
			salaryRange,
			endTime,
			recruiterEmails,
			interviewerEmails,
			user_email,
		} = req.body;

		// Convert the end time string to a Date object
		const end_time = new Date(endTime).toLocaleDateString();
		const current_time = new Date().toLocaleDateString();

		// Retrieve User objects for hiringManager, recruiterContacts and interviewerContacts
		const hiringManagerUser = await User.findOne({ email: user_email });
        console.log("hiringManagerUser:",hiringManagerUser)
		const hiringManager = hiringManagerUser ? hiringManagerUser._id : null;


	

        // Find existing recruiter and interviewer users
        const recruiterUsers = await findExistingUsers(recruiterEmails);
        const interviewerUsers = await findExistingUsers(interviewerEmails);


		const skillsArray = Array.isArray(skills) ? skills : skills.split(",");
        const secondarySkillsArray = Array.isArray(secondarySkills) ? secondarySkills : secondarySkills.split(",");

		// Generate JD ID with prefix and random 8-digit number
		const jdIDPrefix = "JD-";
		const randomEightDigitNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
		const jdID = jdIDPrefix + randomEightDigitNumber;

		// Insert data into MongoDB with creation and expiration timestamps
		const data = {
			jdID, // Include the generated JD ID		
			hiringManager,
			companyName,
			jobDescription,
			jobRole,
			skills: skillsArray,
            secondarySkills: secondarySkillsArray,
			experience,
			salaryRange,
			recruiterContacts: recruiterUsers,
			interviewerContacts: interviewerUsers,
			creation_time: current_time,
			expiration_time: end_time,
			is_active: true, // Initially active
		};
		// Insert data into MongoDB
		const result = await JD_Details.create(data);

		const jds = await JD_Details.find({
			hiringManager: hiringManagerUser._id,
		})
			.populate("hiringManager", "email")
			.populate("recruiterContacts", "email")
			.populate("interviewerContacts", "email");

		res.status(200).json({ jds });
	} catch (error) {
        handleError(res, error);
	}
};


export const editJobdescription = async (req, res) => {
    const jdId = req.params.jdId;
    console.log("Job description to edit:", jdId);
    try {
        if (!jdId) {
            return res.status(400).send("jDID is empty");
        }
        // Find the existing JD document by ID
        const existingJD = await JD_Details.findById(jdId);
        if (!existingJD) {
            return res.status(404).send("Document not found");
        }
        // Create a copy of the previous JD to preserve its details
        const previousJD = new JD_Details({
            ...existingJD.toObject(),
            _id: new mongoose.Types.ObjectId(),
            isNew: true,
            is_active: false, 
            JDEditstatus: "Previous",
        });

        await previousJD.save();
        // console.log("Previous Job Description:", previousJD);

        // Generate a new JD ID for the updated JD
        const generateNewJdID = () => {
            return `JD-${Math.floor(10000000 + Math.random() * 90000000)}`;
        };
        const newJdID = generateNewJdID();

        // Update the existing JD document with new data
        existingJD.companyName = req.body.companyName;
        existingJD.jobDescription = req.body.jobDescription;
        existingJD.jobRole = req.body.jobRole;
        if (req.body.skills) {
            existingJD.skills = Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(",");
        }

        if (req.body.secondarySkills) {
            existingJD.secondarySkills = Array.isArray(req.body.secondarySkills) ? req.body.secondarySkills : req.body.secondarySkills.split(",");
        }
        existingJD.experience = req.body.experience;
        existingJD.salaryRange = req.body.salaryRange;
        existingJD.recruiterContacts = await findExistingUsers(req.body.recruiterEmails);
        existingJD.interviewerContacts = await findExistingUsers(req.body.interviewerEmails);
        existingJD.expiration_time = new Date(req.body.endTime);
        existingJD.JDEditstatus = "Updated"; 
        existingJD.is_active = true; 
        await existingJD.save();
        // Retrieve the updated JD for the response
        const updatedJD = await JD_Details.findById(existingJD._id)
            .populate("hiringManager", "email")
            .populate("recruiterContacts", "email")
            .populate("interviewerContacts", "email");
        console.log("Updated Job Description:", updatedJD);
        res.status(200).json({ updatedJD });
    } catch (error) {
        handleError(res, error);
    }
};


export const getInterviewersByJdId = async (req, res) => {
    try {
      const jdId = req.params.jdId;
      const jdDetails = await JD_Details.findOne({ _id: jdId }).populate('interviewerContacts', 'email');
      if (!jdDetails) {
        return res.status(404).json({ message: 'JD not found' });
      }
      const interviewerEmails = jdDetails.interviewerContacts.map(interviewer => interviewer.email);
      res.json({ interviewerEmails });
    } catch (error) {
        handleError(res, error);
    }
  };

  export const toggleJdActivation = async (req, res) => {
    const jdId = req.params.jdId;
    console.log("JD ID for activation/deactivation:", jdId);
    try {
        if (!jdId) {
            return res.status(400).send("JD ID not provided");
        }
        // Check if the document exists before attempting to update it
        const existingJd = await JD_Details.findById(jdId);
        if (!existingJd) {
            return res.status(404).send("JD not found");
        }
        // Determine the new value for is_active based on the current value
        const newIsActiveValue = !existingJd.is_active;
        // Update the document with the new value
        const result = await JD_Details.updateOne(
            { _id: jdId },
            { $set: { is_active: newIsActiveValue } }
        );
        console.log("result:", result);
 
        // Check if the JD was successfully updated
        if (result.matchedCount === 1) {
            res.send(`JD ${newIsActiveValue ? 'activated' : 'deactivated'} successfully`);
        } else {
            res.status(500).send("Failed to toggle JD activation");
        }
    } catch (error) {
        handleError(res, error);
    }
};
 
 
 
 
  
export const getInactiveJdsByHiringManager = async (req, res) => {
    try {
        let email = req.params.email.toLowerCase(); // Extracting and normalizing email
        console.log("email:", email);
 
        // Query inactive JDs, populate the hiring manager field, and filter by email
        const inactiveJds = await JD_Details.find({ is_active: false })
            .populate({
                path: 'hiringManager',
                match: { email: email } // Filter by hiring manager's email
            })
            .populate('recruiterContacts interviewerContacts');
 
        // Filter out the populated but unmatched hiring manager objects
        const filteredJds = inactiveJds.filter(jd => jd.hiringManager);
 
        // Log the retrieved inactive JDs
        console.log("status:", filteredJds);
 
        // Send the filtered inactive JDs as JSON response
        res.json(filteredJds);
    } catch (error) {
        handleError(res, error);
    }
};
 
 
export const fetchJds = async (req, res) => {
    const hiringManagerEmail = req.query.email;
 
    try {
        // Find the User with the provided email (hiring manager)
        const hiringManager = await User.findOne({ email: hiringManagerEmail });
 
        if (!hiringManager) {
            return res.status(404).json({ message: "Hiring manager not found" });
        }
 
        // Fetch only the active JDs where the hiringManager field matches the hiring manager's ID
        const activeJds = await JD_Details.find({ hiringManager: hiringManager._id, is_active: true })
            .populate("hiringManager", "email")
            .populate("recruiterContacts", "email")
            .populate("interviewerContacts", "email");


        
            // Check expiration time of each JD and update is_active status if expired
            const now = new Date();
            for (let jd of activeJds) {
                if (jd.expiration_time < now) {
                    // Update JD's is_active status to false
                    await JD_Details.findByIdAndUpdate(jd._id, { is_active: false });
                    // Update is_active status in the fetched JDs array as well
                    jd.is_active = false;
                }
            }

        console.log("activeJds in fetchJds", activeJds);
        // res.status(200).json({ activeJds });
        // return { activeJds }; // Return activeJds in the response
        return res.status(200).json({ activeJds });

    } catch (error) {
        handleError(res, error);
    }
};
                       

