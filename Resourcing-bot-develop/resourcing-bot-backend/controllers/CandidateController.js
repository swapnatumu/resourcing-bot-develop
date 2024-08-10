
import {
	
	Candidate_Profiles,
	User,
    JD_Details,
	Interviews,

} from "../models/mongoschema.js";
import express, { response } from "express";



import mongoose from 'mongoose'; 
  
const { ObjectId } = mongoose.Types; 



const app = express();



// Error handler function
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  };
//  retriving the hm accepted resumes based on the jdId
export const retrieveacceptedresumes = async (req, res) => {
	try {
		const { jdId } = req.body;
		console.log("jdid:", jdId);

		// Check if jdid is provided in the request
		if (!jdId) {
			return res.status(400).json({ error: "jdid parameter is required" });
		}

		// Search the CandidateProfile collection based on the provided jdid
		const acceptedResumes = await Candidate_Profiles.find({
			jddetails_id: jdId,
			"overallStatus": "HiringManagerScreenAccepted",
		});
		console.log("acceptedResumes:", acceptedResumes);

		if (!acceptedResumes || acceptedResumes.length === 0) {
            return res.status(200).json({ acceptedResumes: 0 });
        }
		// Extract jobrole, candidateemail, and resumeurl from each document
		const acceptedResumesData = acceptedResumes.map(
			({ jobRole, candidateEmail, resumeUrl }) => ({
				jobRole,
				candidateEmail,
				resumeUrl,
               
			})
		);
		console.log("acceptedResumesData: ", acceptedResumesData);
		// Return the extracted data
		res.status(200).json({ acceptedResumes: acceptedResumesData });
	} catch (error) {
        handleError(res, error);
	}
};

export const getStatusResults = async (req, res) => {
    const { jdId } = req.body;
    try {
 
        // Query the database to find interviews matching the jdId
        const document = await Interviews.find({ jddetails_id: jdId })
         .populate('jd')
        .populate('candidate')
        .populate('recruiter')
        .populate('interviewer')

		const documentId = document.map(doc => doc._id);

        console.log(documentId);

	const interview_status_docs=await Candidate_Profiles.find({ jddetails_id: jdId ,interviewid:documentId})
	console.log("interview_status_docs:",interview_status_docs);

	const interview_status = interview_status_docs.map(doc => doc.interviewStatus);
	console.log("interview_status:",interview_status);

	return res.json({document,interview_status}) ;

	} catch (error) {
        handleError(res, error);
	}
	};

    export const scheduling_button = async (req, res) => {
		try {
			// Extract candidate email and job details ID from request body
			const { email, jdid } = req.body;
			console.log("request body:",req.body);

          
			// Query the database to find the candidate profile
			const candidateProfile = await Candidate_Profiles.findOne({ candidateEmail:email, jddetails_id:jdid });
			console.log("candidate profile:", candidateProfile);

			// If candidate profile not found or screening test status not passed, return status false
			if (!candidateProfile || candidateProfile.screeningtestStatus !== 'Screening_test_Passed') {
				return res.json({ status: false });
			}
	
			// If screening test status passed, return status true
			return res.json({ status: true });
		} catch (error) {
            handleError(res, error);
		}
	};


// Based on the jdid candidates profile fetch
export const get_candidate_profiles_by_jdID = async (req, res) => {
    try {
        const { jdId } = req.params;
        const candidateProfiles = await Candidate_Profiles.find({ jddetails_id: jdId });

        if (!candidateProfiles.length) {
            return res.status(404).json({ message: 'No candidate profiles found for this JD.' });
        }

        res.status(200).json(candidateProfiles);
    } catch (error) {
        handleError(res, error);
    }
};


export const updateHoldStatusHmScreening = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { action, feedback } = req.body;

        const candidateProfile = await Candidate_Profiles.findById(candidateId);
        if (!candidateProfile) {
            return res.status(404).json({ success: false, message: 'Candidate profile not found' });
        }

        let newStatus;
        if (action === 'hold') {
            // Putting candidate on hold
            switch (candidateProfile.overallStatus) {
                case 'Created':
                    newStatus = 'Hold';
                    break;
                case 'InterviewScheduled':
                    newStatus = 'Hold_InterviewScheduled';
                    break;
                case 'TestPassed':
                    newStatus = 'Hold_TestPassed';
                    break;
                case 'Selected':
                    newStatus = 'Selected_hold';
                    break;
                case 'HiringManagerScreenAccepted':
                    newStatus = 'HiringManagerHold';
                    break;
                case 'DocVerification':
                    newStatus = 'Hold_DocVerification';
                    break;
                    case 'Selected_verification':
                        newStatus = 'Hold_Selected_verification';
                        break;
                default:
                    newStatus = candidateProfile.overallStatus;
                    break;
            }
        } else if (action === 'unhold') {
            // Unholding candidate
            switch (candidateProfile.overallStatus) {
                case 'Hold':
                    newStatus = 'Created';
                    break;
                case 'Hold_InterviewScheduled':
                    newStatus = 'InterviewScheduled';
                    break;
                case 'Hold_TestPassed':
                    newStatus = 'TestPassed';
                    break;
                case 'Selected_hold':
                    newStatus = 'Selected';
                    break;
                case 'HiringManagerHold':
                    newStatus = 'HiringManagerScreenAccepted';
                    break;
                case 'Hold_DocVerification':
                    newStatus = 'DocVerification';
                    break;
                case 'Hold_Selected_verification':
                    newStatus = 'Selected_verification';
                    break;
                case 'RecruiterScreenHold':
                    newStatus = 'HiringManagerScreenAccepted';
                    break;
                default:
                    newStatus = candidateProfile.overallStatus;
                    break;
            }
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action' });
        }

        candidateProfile.overallStatus = newStatus;
        await candidateProfile.save();
        res.json({ success: true, newStatus }); // Return new status
    } catch (error) {
        handleError(res, error);
    }
};




export const candidateProfileDataButton = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const candidate = await Candidate_Profiles.findById(candidateId)
            // .populate('screeningtestid')
            .populate('interviewid');

        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // If the candidate has an interview associated, populate its details
        if (candidate.interviewid) {
            const interview = await Interviews.findById(candidate.interviewid);
            candidate.interviewDetails = interview; 
        }

        res.status(200).json({ candidate });
    } catch (error) {
        handleError(res, error);
    }
};


export const getInterviewsByInterviewerEmail = async (req, res) => {
    const interviewerEmail = req.params.email;
    console.log("email:", interviewerEmail);

    try {
        // Query the Interviews collection where the interviewer array contains the specified email
        const interviews = await Interviews.find({
            interviewer: { $elemMatch: { $eq: interviewerEmail } }
        })
        // .populate('jd')
        .populate({
          path: 'jddetails_id',  // Populate the JD_Details referenced by jddetails_id
          select: 'jdID',  // Only select the jdID field
      })
        .populate('candidate')
        .populate('recruiter')
        .populate('interviewer');
        console.log("Populated Interviews:", interviews);
        if (interviews.length === 0) {
            return res.status(404).json({ message: 'No interviews found for the specified email' });
        }

        res.json(interviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};





// Recruiter accepting/rejecting the profile
export const processResume = async (req, res) => {
    console.log("Processing resume request");
  
    try {
        const { candidateId, action, recruiterFeedback } = req.body;
  
        // Validate input
        if (!candidateId || !action) {
            console.log("Invalid request parameters");
            return res.status(400).json({ success: false, error: "Missing required parameters" });
        }
  
        console.log("Finding existing resume in Candidate_Profiles collection");
        
        // Find the existing resume by candidateId
        const existingResume = await Candidate_Profiles.findOne({ candidateId });
  
        if (!existingResume) {
            console.log("Resume not found");
            return res.status(404).json({ success: false, error: "Resume not found" });
        }
  
        // Map action to status
        const statusMap = {
            accept: "RecruiterScreenAccept",
            reject: "RecruiterScreenReject",
            hold: "RecruiterScreenHold"
        };
  
        // Set overall status based on action
        if (statusMap[action]) {
            existingResume.overallStatus = statusMap[action];
        } else {
            console.log("Invalid action");
            return res.status(400).json({ success: false, error: "Invalid action specified" });
        }
  
        // Update recruiter feedback
        existingResume.recruiterFeedback = recruiterFeedback;
  
        // Save the updated resume
        await existingResume.save();
        console.log("Resume updated and saved");
  
        return res.json({ success: true });
  
    } catch (error) {
        console.error("Error processing resume:", error);
        handleError(res, error);
    }
  };
  

export const updateCandidateStatusHmScreening = async (req, res) => {
    try {
      const { candidateId } = req.params;
      const { action, feedback, userRole,feedbackField } = req.body; // Include userRole to differentiate between Hiring Manager and Recruiter
      const candidateProfile = await Candidate_Profiles.findById(candidateId);
      if (!candidateProfile) {
        return res.status(404).json({ success: false, message: 'Candidate profile not found' });
      }
  
      let updatedStatus;
      
      if (userRole === 'hiringManager') {
        switch (action) {
          case 'accept':
            updatedStatus = 'HiringManagerScreenAccepted';
            break;
          case 'reject':
            updatedStatus = 'HiringManagerScreenRejected';
            break;
          case 'on_hold':
            updatedStatus = 'HiringManagerHold';
            break;
          default:
            return res.status(400).json({ success: false, message: 'Invalid action for Hiring Manager' });
        }
        candidateProfile.hiringManagerFeedback = feedback;
      } else if (userRole === 'recruiter') {
        if (candidateProfile.overallStatus !== 'NewCandidate') {
          return res.status(400).json({ success: false, message: 'Invalid overall status for Recruiter actions' });
        }
        switch (action) {
          case 'accept':
            updatedStatus = 'RecruiterScreenAccept';
            break;
          case 'reject':
            updatedStatus = 'RecruiterScreenReject';
            break;
          case 'on_hold':
            updatedStatus = 'RecruiterScreenHold';
            break;
          default:
            return res.status(400).json({ success: false, message: 'Invalid action for Recruiter' });
        }
        candidateProfile.recruiterFeedback = feedback;
      } else {
        return res.status(403).json({ success: false, message: 'Unauthorized user role' });
      }
  
      candidateProfile.overallStatus = updatedStatus;
      await candidateProfile.save();
      
      res.json({ success: true });
    } catch (error) {
      handleError(res, error);
    }
  };

  
    export const createCandidate = async (req, res) => {
      try {
        const { 
          resumeUrl, 
          jobDetailsId, 
          job_role,
          extracted_email, 
          extracted_phone_number,       
          extracted_name,
          address,
          summaries,
        } = req.body;
        console.log("req.body... ",req.body);
    
        if (!resumeUrl || !jobDetailsId || !job_role || !extracted_email || !extracted_phone_number || !extracted_name || !address) {
          console.log("Invalid request parameters");
          return res.status(400).json({ success: false, error: "Invalid request parameters" });
        }
    
        console.log("Finding existing resume in Candidate_Profiles collection");
    
        // Check if the candidate already exists
        const existingResume = await Candidate_Profiles.findOne({
          resumeUrl,
          candidateEmail: extracted_email,
          jddetails_id: jobDetailsId,
        });
    
        if (existingResume) {
          // If found, update the existing candidate
          console.log("Candidate profile exists, no action required");   
        } else {
          // If not found, create a new candidate
          console.log("Creating new candidate profile");
    
          const IDPrefix = "CD-";
          const randomEightDigitNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
          const candidateID = IDPrefix + randomEightDigitNumber;
    
          const acceptedResume = new Candidate_Profiles({
            candidateID,
            candidatename: extracted_name,
            candidateEmail: extracted_email,
            phone: extracted_phone_number,
            address,
            overallStatus: "NewCandidate",        
            jddetails_id: jobDetailsId,        
            resumeUrl, 
            summaries,
            jobRole:job_role,
            
          });
    
          await acceptedResume.save();
          console.log("New resume document created and saved");
        }
    
        res.json({ success: true });
    
      } catch (error) {
        handleError(res, error);
      }
    };


export const getCandidateProfile = async (req, res) => { 
    try { 
    const { candidateId } = req.params; 

    const candidate = await Candidate_Profiles.findById(candidateId) 
    // .populate('screeningtestid') 
    .populate('interviewid'); 
    if (!candidate) { 
    return res.status(404).json({ message: 'Candidate not found' }); 
    } 
    // If the candidate has an interview associated, populate its details 
    if (candidate.interviewid) { 
    const interview = await Interviews.findById(candidate.interviewid); 
    candidate.interviewDetails = interview;  
    } 
    res.status(200).json({ candidate }); 
    } catch (error) { 
    handleError(res, error); 
    } 
    }; 
    
     

    export const scheduledcandidatesdetails = async (req, res) => { 
    const { email } = req.query; 
    try { 
    // Find the user by email to get their ObjectId 
    const user = await User.findOne({ email: email }); 
        if (!user) { 
        return res.status(404).json({ message: 'User not found for the provided email.' }); 
        } 
    // Find the JD details where the user is either a recruiter or an interviewer 
        const jdDetails = await JD_Details.findOne({ 
             $or: [ 
        { recruiterContacts: user._id }, 
        { interviewerContacts: user._id } 
        ] 
        }); 


    if (!jdDetails) { 
    return res.status(404).json({ message: 'JD Details not found for the provided email.' }); 
    } 


    // Find all candidates with 'InterviewScheduled' status 
    const candidates = await Candidate_Profiles.find({ 
    overallStatus: 'InterviewScheduled' 
    }).populate('jddetails_id'); // Optional: Populate JD details for each candidate 
    console.log("candidates: " ,candidates) 
    // Extract jddetails_id and candidateEmails 
    const jddetailsIds = candidates.map(candidate => candidate.jddetails_id._id.toString()); 
    const candidateEmails = candidates.map(candidate => candidate.candidateEmail); 
 
    // Fetch interviews based on candidate email and JD details ID 
    const interviews = await Interviews.find({ 
    jddetails_id: { $in: jddetailsIds }, 
    candidate_email: { $in: candidateEmails } 
    }).populate('jd').exec(); 
    console.log("Interviews:", interviews); 

     // Map candidate details and include interview details 
    const candidateDetails = candidates.map(candidate => { 
    // Find the interview that matches the candidate's email and JD details ID 

    const interview = interviews.find(interview => 
    interview.candidate_email === candidates.candidateEmail  
    // && 
    // interview.jddetails_id.toString() === candidates.jddetails_id.toString() 
    ); 
     return {...candidate._doc, // Spread existing candidate details 
    interviewDetails: interview || null // Add interview details if available 
    }; 
    }); 
    return res.status(200).json(candidateDetails); 
    // return res.status(200).json(candidates); 
    } catch (error) { 
    console.error('Error fetching candidates:', error); 
    return res.status(500).json({ message: 'Server error' }); 
    } 
    }; 






