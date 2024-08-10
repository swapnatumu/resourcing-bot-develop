import express from "express";

import {
	register,	
	login,
	updateProfile,
	changePassword,
	getRecruitersAndInterviewers,
	socialmedialogin,
	forgotPassword,
	resetPassword,
	logout,
	
} from "../controllers/UserController.js";

import {
	retrieveacceptedresumes,	
	getStatusResults,
	scheduling_button,
	get_candidate_profiles_by_jdID,
	updateHoldStatusHmScreening,
	candidateProfileDataButton,
 	getInterviewsByInterviewerEmail,
	processResume,	
	updateCandidateStatusHmScreening,
	createCandidate,
	getCandidateProfile,
	scheduledcandidatesdetails,

} from "../controllers/CandidateController.js";

import {
	createJobDescription,	
	editJobdescription,
	getInterviewersByJdId,
	toggleJdActivation,
	getInactiveJdsByHiringManager,
	fetchJds,	

} from "../controllers/JobDescriptionController.js";


import {
	approveUser,
	rejectUser,
} from "../controllers/AdminController.js";

import {
	uploadScreeningTest,	
	getScreeningTestById,
	
} from "../controllers/ScreeningTestController.js";

const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/fetchJds").get(fetchJds);

router.route("/forgotPassword").post(forgotPassword);

router.route("/resetPassword").post(resetPassword);

router.route("/createJobDescription").post(createJobDescription);

router.get("/getRecruitersAndInterviewers", getRecruitersAndInterviewers);

router.put("/edit/:jdId", editJobdescription);

router.route("/retrieveacceptedresumes").post(retrieveacceptedresumes);

router.route("/uploadScreeningTest").post(uploadScreeningTest);

router.get('/interviewer/:jdId', getInterviewersByJdId);

router.post('/getStatusResults', getStatusResults);

router.put('/delete/:jdId', toggleJdActivation);
 
router.get('/inactive-jds/:email', getInactiveJdsByHiringManager);

router.route('/approveUser').post(approveUser);

router.route('/rejectUser').post(rejectUser);

router.route('/scheduling_button').post(scheduling_button); 

router.post('/socialmedialogin', socialmedialogin);

router.post('/processResume', processResume);

router.route("/candidateProfiles/:candidateId/updateStatus").post(updateCandidateStatusHmScreening);

router.route("/candidateProfiles/:candidateId").post(getCandidateProfile);

router.get('/get_candidate_profiles_by_jdID/:jdId', get_candidate_profiles_by_jdID);

router.post('/updateHoldStatusHmScreening/:candidateId/updateStatus', updateHoldStatusHmScreening);

router.get('/candidateProfileDataButton/:candidateId', candidateProfileDataButton);

router.put("/updateProfile", updateProfile);

router.put("/changePassword", changePassword);

router.post('/logout', logout);

router.get('/getInterviewsByInterviewerEmail/:email', getInterviewsByInterviewerEmail);
 
router.post('/createCandidate', createCandidate);

router.post('/screening/:id', getScreeningTestById);

router.get('/scheduledcandidatesdetails', scheduledcandidatesdetails);


router.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send("Something broke!");
});

export default router;