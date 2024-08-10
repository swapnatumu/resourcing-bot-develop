import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


// DB Schema definition
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true }, // Index on email field
    password: { type: String, required: true },
    phone: { type: String },
    userType: {
        type: String,
        required: true,
        enum: ['admin', 'hiringManager', 'recruiter', 'interviewer'],
        index: true
    },
    Approval_status: {
        type: String,
        enum: ['Pending', 'approved', 'rejected'],
        default: 'Pending',
        index: true // Index on Approval_status field
    },
    otp: { type: String },
    lastLogin: { type: Date },  // Tracks the last login time
    isActive: { type: Boolean, default: true }, // Status to enable or disable the user account
});

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ Approval_status: 1 });
UserSchema.index({ userType: 1 });


const JD_DetailsSchema = new mongoose.Schema({
    jdID: { type: String, required: true },
    hiringManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    companyName: { type: String, required: true },
    jobDescription: { type: String, required: true },
    jobRole: { type: String, required: true },
    skills: { type: [String], required: true },
    secondarySkills: { type: [String], required: true },
    experience: { type: String, required: true },
    salaryRange: { type: String, required: true },
    recruiterContacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    interviewerContacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    creation_time: { type: Date, default: Date.now },
    expiration_time: { type: Date },
    is_active: { type: Boolean, default: true },
    location: { type: String }, // Optional: location of the job if relevant
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Temporary'] }, // Job type might be useful
    numberOfVacancies: { type: Number, min: 1 }, // To specify how many openings are there for the job role
    applicationDeadline: { type: Date }, // Deadline for applications
    JDEditstatus:{ type:String}, // before editing save the jd
});


const CandidateProfileSchema = new mongoose.Schema({
    candidateID: { type: String, unique: true },
    candidatename: { type: String, required: true },
	candidateEmail: {
        type: String,
        required: true
    },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    summaries: { type: String, required: true },  
    jddetails_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JD_Details",
        required: true
    },
    jobRole: {
        type: String 
    },
    resumeUrl: {
        type: String,
        required: true
    },
    overallStatus: {
        type: String,
        enum: [
            'NewCandidate', 
            'RecruiterScreenReject', 
            'RecruiterScreenAccept',
            'RecruiterScreenHold', 
            'HiringManagerScreenRejected', 
            'HiringManagerScreenAccepted', 
            'HiringManagerHold',
            'ScreeningTestSent',
            'TestPassed', 
            'TestFailed', 
            'Hold_TestPassed',
            'InterviewScheduled', 
            'Selected', 
            'Rejected', 
            'Hold',
            'Selected_hold',
            'DocumentEmailSent',
            "DocVerification",
            "Hold_DocVerification",
            "Selected_verification",
            'Rejected_verification',
            'Hold_Selected_verification', 

        ],
        default: 'NewCandidate'
    },
    recruiterFeedback: {
        type: String,
        default: ''
    },
    hiringManagerFeedback: {
        type: String,
        default: ''
    },
    testFeedback: {
        type: String,
        default: ''
    },
    interviewFeedback: {
        feedbackText: {
            type: String,
           
        },
        programmingRating: {
            type: Number,
        },
        performanceRating: {
            type: Number,
            // default: 0
        },
        reviewRating: {
            type: String,
            // default: ''
        },
        communicationSkills: {type: Number,},
        problemSolvingSkills: {type: Number,},
        areasOfInterest: {type: String,},
        areasOfStrength: {type: String,},
        suggestion: {type: String,},
        technicalSkills: {type: String,},        
        
    },
    screeningtestid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Screening_Test",
    },
    interviewid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interviews",
    },
    Documents: [{
        filename: String,
        path: String
    }],
  
});

// Create indexes
CandidateProfileSchema.index({ candidateEmail: 1 });
CandidateProfileSchema.index({ resumeUrl: 1 });


const ScreeningTestSchema = new mongoose.Schema({
    ScreeningID: { type: String, unique: true },
	jd: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "JD_Details",
		required: true,
	},
	jobRole: { type: String, required: true },
	questions: [
		{
			questionText: { type: String, required: true },
			answerOptions: { type: [String], required: true },
			correctAnswer: { type: String, required: true },
		},
	],
	passingScore: { type: Number },
});
const InterviewSchema = new mongoose.Schema({
    jddetails_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JD_Details",
        required: true
    }, // Reference to Job Descriptions collection
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate_Profile",
        required: true
    }, // Reference to Candidate Profiles collection
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, // Reference to Users collection for recruiter
    interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, // Reference to Users collection for interviewer
    dateAndTime: { type: Date, required: true }, // Scheduled date and time for the interview
    feedback: { type: String, default: "" }, // Interviewer's feedback
    interviewType: { type: String, enum: ['In-person', 'Remote'], required: true }, // Type of interview: In-person or Remote
    interviewStatus: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show'], default: 'Scheduled' }, // Status of the interview
    outcome: { type: String, enum: ['Passed', 'Failed', 'On-hold'], default: 'On-hold' } // Outcome of the interview
});


UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

UserSchema.methods.getJWTToken = function () {
	return jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
	});
};

UserSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
const JD_Details = mongoose.model("JD_Details", JD_DetailsSchema);
const Candidate_Profiles = mongoose.model(
	"Candidate_Profile",
	CandidateProfileSchema
);
const Screening_Test = mongoose.model("Screening_Test", ScreeningTestSchema);
const Interviews = mongoose.model("Interviews", InterviewSchema);
export { User, JD_Details, Candidate_Profiles, Screening_Test, Interviews };