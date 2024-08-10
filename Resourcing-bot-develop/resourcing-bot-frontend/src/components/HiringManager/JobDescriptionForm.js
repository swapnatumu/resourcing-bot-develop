
import React, { useState, useEffect } from "react";
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,Toolbar,Box,Typography,IconButton,Dialog,DialogTitle,DialogContent,DialogActions
} from "@mui/material";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEmailTemplate } from '../../emailTemplates/emailTemplate'; 
import { jobRoles, salaryRanges, experiences, skills,secondarySkills } from  '../shared/dropdown_values';

function JobDescriptionForm({ hiringManagerEmail, jd }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [submitted, setSubmitted] = useState(false);
    const [recruiterEmails, setRecruiterEmails] = useState([]);
    const [interviewerEmails, setInterviewerEmails] = useState([]);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    
    const getRecruitersAndInterviewersApiUrl = process.env.REACT_APP_GET_RECRUITERS_INTERVIEWERS_API;
    const createJobDescriptionApiUrl = process.env.REACT_APP_CREATE_JOB_API;
    const editJDApiUrl = process.env.REACT_APP_EDIT_JD_API;
    const sendemailApiUrl = process.env.REACT_APP_SEND_EMAIL_API;
    const fileuploadApiUrl = process.env.REACT_APP_PARSE_JD_PDF_API;



    const initialFormData = {
        companyName: "",
        jobDescription: "",
        jobRole: "",
        skills: [],
        secondarySkills: [],
        experience: "",
        salaryRange: "",
        endTime: "",
        recruiterEmails: [],
        interviewerEmails: [],
    };

    const [formData, setFormData] = useState(initialFormData);

 
    useEffect(() => {
        if (jd) {
            const recruiterEmails =
                jd.recruiterContacts !== undefined
                    ? jd.recruiterContacts.map((recruiter) => recruiter.email)
                    : [];
 
            const interviewerEmails =
                jd.interviewerContacts !== undefined
                    ? jd.interviewerContacts.map((interviewer) => interviewer.email)
                    : [];
            const formattedDate =
                jd.expiration_time !== undefined
                    ? new Date(jd.expiration_time).toISOString().split("T")[0]
                    : "";
 
            setFormData((prevState) => ({
                ...prevState,
                companyName: jd.companyName,
                jobDescription: jd.jobDescription,
                jobRole: jd.jobRole,
                skills: jd.skills !== undefined ? jd.skills : [],
                secondarySkills:jd.secondarySkills!==undefined?jd.secondarySkills:[],
                experience: jd.experience,
                salaryRange: jd.salaryRange,
                endTime: formattedDate,
                recruiterEmails: recruiterEmails,
                interviewerEmails: interviewerEmails,
            }));
        }
    }, [jd]);
 
    useEffect(() => {
        const fetchRecruitersAndInterviewers = async () => {
            try {
                const response = await axios.get(getRecruitersAndInterviewersApiUrl);
                const { recruiters, interviewers } = response.data;
                setRecruiterEmails(recruiters);
                setInterviewerEmails(interviewers);
            } catch (error) {
                console.error("Error fetching recruiters and interviewers:", error);
            }
        };
 
        fetchRecruitersAndInterviewers();
    }, []);
 
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };



const handlesecondskillsChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
        ...prevState,
        [name]: Array.isArray(value) ? value : value.split(','),
    }));
};

    // Function to send email notification
    const sendEmailNotification = async (recipientEmail, subject, body) => {
        try {

            // const loginUrl = process.env.REACT_APP_LOGIN_URL;
            const loginUrl = process.env.REACT_APP_LOCAL_HOST_API;
            const emailBody = `
                        ${body}
                        <p>Please click the link below to access the login page:</p>
                        <p><a href="${loginUrl}">Click here to login</a></p>
                        <p>Best regards,</p>
                    `;               
            await axios.post(sendemailApiUrl, {
                candidateEmail: [recipientEmail],
                subject,
                body: emailBody,
            });
        } catch (error) {
            console.error("Error sending email:", error);
        }
    };
 
    
    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const formDataCopy = { ...formData, user_email: hiringManagerEmail };
 
        try {
            let response;
            if (jd) {
                // Editing scenario: Update existing entry
                response = await fetch(`${editJDApiUrl}/${jd._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formDataCopy),
                    credentials: "include",
                });
            } else {
                // Creating scenario: Create a new entry
                response = await fetch(createJobDescriptionApiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formDataCopy),
                    credentials: "include",
                });
            }
 
            if (!response.ok) {
                throw new Error("Failed to submit form");
            }
            const responseData = await response.json();
            setShowSuccessDialog(true);
            setSubmitted(true);
            const jds = responseData.jds;
            console.log("response:", jds);
  // Send email notifications to recruiters
        if (formData.recruiterEmails && formData.recruiterEmails.length > 0) {
            formData.recruiterEmails.forEach((recruiterEmail) => {
                const recruiterTemplate = getEmailTemplate('recruiterNotification');
                if (recruiterTemplate) {
                    console.log("Recruiter Email Data:", recruiterTemplate.subject, recruiterTemplate.body);
                    sendEmailNotification(
                        recruiterEmail,
                        recruiterTemplate.subject,
                        recruiterTemplate.body
                    );
                } else {
                    console.error("Recruiter template not found or undefined");
                }
            });
        }
        // Send email notifications to interviewers
        if (formData.interviewerEmails && formData.interviewerEmails.length > 0) {
            formData.interviewerEmails.forEach((interviewerEmail) => {
                const interviewerTemplate = getEmailTemplate('interviewerNotification');
                if (interviewerTemplate) {
                    console.log("Interviewer Email Data:", interviewerTemplate.subject, interviewerTemplate.body);

                    sendEmailNotification(
                        interviewerEmail,
                        interviewerTemplate.subject,
                        interviewerTemplate.body
                    );
                } else {
                    console.error("Interviewer template not found or undefined");
                }
            });
        }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };
 
	
    // Function to handle file upload
    const handleFileChange = async (event) => {
        console.log("In handleFileChange", event.target.files[0]);
        event.preventDefault();
        // Access the file directly from the event
        const selectedFile = event.target.files[0];
 
        // Check if a file is selected
        if (!selectedFile) {
            console.error("No file selected");
            return;
        }
 
        // Create a FormData object and append the file to it
        const formuploadedData = new FormData();
        formuploadedData.append("file", selectedFile);
        try {
            // Send a POST request to the backend API
            const response = await axios.post(
                fileuploadApiUrl,
                formuploadedData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
  
            // Assuming response.data is an object with a 'text' property
            const responseDataText = response.data.text;
 
            setFormData((prevState) => ({
                ...prevState,
                jobDescription: responseDataText,
            }));
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleBack = () => {
        if (location.state && location.state.fromEditJobDescription) {
          navigate(-1); 
        } else {
          navigate(-0); 
        }
      };

    const handleCloseSuccessDialog = () => {
        setShowSuccessDialog(false); // Close success dialog
        setFormData(initialFormData);
    };
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    return (
        
        <div style={{ textAlign: "flex-start", marginTop: "10px",alignItems:'flex-start',width:'40%'}}>
    <div style={{ textAlign: "flex-start", marginTop: "20px", alignItems: 'flex-start' }}>
      <IconButton onClick={handleBack} style={{ position: "relative", color: "black", top: '10px' }}>
        <ArrowBackIcon style={{ fontSize: "50px" }} />
      </IconButton>
    </div>
            {submitted && <div></div>}{" "}
            {/* Confirmation message */}
            <form
                action="/submit"
                method="post"
                encType="multipart/form-data"
                style={{ width: "500px", margin: "auto" }}
                onSubmit={handleSubmit}
            >
            <Typography style={{ position: "relative", color: "black", marginTop: "10px", fontFamily: 'Righteous', fontSize: '35px', fontWeight: 'bold' ,
                backgroundColor: 'rgba(232, 222, 248, 1)',borderRadius: "8px",
            }}>
            Job Description Form
            </Typography>
                <br></br> 
                {/* Company Name */}
                <TextField
                    id="companyName"
                    type="text"
                    name="companyName"
                    label="Company Name"
                    placeholder="Enter Company Name"
                    required
                    fullWidth
                    style={{ marginBottom: "20px" }}
                    onChange={handleChange}
                    value={formData.companyName}
                />
                <br />
 
                <TextField
                    id="jobDescription"
                    name="jobDescription"
                    label="Job Description"
                    placeholder="Enter Job Description"
                    multiline
                    rows={4}
                    fullWidth
                    style={{ marginBottom: "20px" }}
                    onChange={handleChange}
                    value={formData.jobDescription}
                />
 
                <TextField
                    id="fileInput"
                    type="file"
                    name="fileInput"
                    label="Upload File"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ inputProps: { accept: ".pdf, .doc" } }}
                    fullWidth
                    style={{ marginBottom: "20px" }}
                    onChange={handleFileChange}
                />
                
 
                <FormControl fullWidth style={{ marginBottom: "20px", position: "relative" }} required>
                    {formData.jobRole === "" && (
                        <InputLabel
                        id="jobRole-label"
                        style={{ position: "absolute", left: "15px", transform: "translate(0, 50%)" }}
                        >
                        Job Role
                        </InputLabel>
                    )}
                    <Select
                        labelId="jobRole-label"
                        id="jobRole"
                        name="jobRole"
                        value={formData.jobRole}
                        onChange={handleChange}
                        fullWidth
                        style={{ marginBottom: "20px" }}
                        displayEmpty
                        required
                    >
                        <MenuItem value="" disabled></MenuItem>
                        {jobRoles.map((role, index) => (
                        <MenuItem key={index} value={role.value}>
                            {role.label}
                        </MenuItem>
                        ))}
                    </Select>
                    </FormControl>
                <FormControl fullWidth style={{ marginBottom: "20px" }} required>
                {formData.skills.length === 0 && (
                    <InputLabel
                    id="skills-label"
                    style={{ position: "absolute", left: "15px", transform: "translate(0, 50%)" }}
                    >
                    Primary Skills
                    </InputLabel>
                )}
                <Select
                    id="skills"
                    name="skills"
                    labelId="skills-label"
                    value={formData.skills.length > 0 ? formData.skills : []}
                    onChange={handleChange}
                    multiple
                    renderValue={(selected) => selected.join(", ")}
                >
                    <MenuItem value="" disabled>
                    Select Skills
                    </MenuItem>
                    {skills.map((skill, index) => (
                    <MenuItem key={index} value={skill}>
                        {skill}
                    </MenuItem>
                    ))}
                </Select>

                </FormControl>
 

               <FormControl fullWidth style={{ marginBottom: "20px" }} required>
                {formData.secondarySkills.length === 0 && (
                    <InputLabel
                        id="secondary-skills-label"
                        style={{ position: "absolute", left: "15px", transform: "translate(0, 50%)" }}
                    >
                        Secondary Skills
                    </InputLabel>
                )}
                            
                    <Select
                        id="secondarySkills"
                        name="secondarySkills"
                        labelId="secondary-skills-label"
                        value={formData.secondarySkills}  
                        onChange={handlesecondskillsChange}
                        multiple
                        renderValue={(selected) => selected.join(", ")}
                    >
                        {secondarySkills.map((secondarySkill, index) => (
                            <MenuItem key={index} value={secondarySkill}>
                                {secondarySkill}
                            </MenuItem>
                        ))}
                    </Select> 


            </FormControl>
                            <FormControl fullWidth style={{ marginBottom: "20px" }}>
                {formData.experience === "" && (
                    <InputLabel
                    id="experience-label"
                    style={{ position: "absolute",  left: "15px", transform: "translate(0, 50%)" }}
                    >
                    Experience
                    </InputLabel>
                )}
                <Select
                    labelId="experience-label"
                    id="experience"
                    name="experience"
                    required
                    onChange={handleChange}
                    value={formData.experience}
                >
                    <MenuItem value="">Select Experience</MenuItem>
                    {experiences.map((experience, index) => (
                    <MenuItem key={index} value={experience.value}>
                        {experience.label}
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>
                <FormControl fullWidth style={{ marginBottom: "20px" }} required>
                {formData.salaryRange === "" && (
                    <InputLabel
                    id="salaryRange-label"
                    style={{ position: "absolute",  left: "15px", transform: "translate(0, 50%)" }}
                    >
                    Salary Range
                    </InputLabel>
                )}
                <Select
                    id="salaryRange"
                    name="salaryRange"
                    labelId="salaryRange-label"
                    value={formData.salaryRange}
                    onChange={handleChange}
                >
                    <MenuItem value="" disabled>
                    Select Salary Range
                    </MenuItem>
                    {salaryRanges.map((range, index) => (
                    <MenuItem key={index} value={range.value}>
                        {range.label}
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>
                <FormControl fullWidth style={{ marginBottom: "20px" }}>
                {formData.recruiterEmails.length === 0 && (
                    <InputLabel
                    id="recruiterEmail-label"
                    style={{ position: "absolute", left: "15px", transform: "translate(0, 50%)" }}
                    >
                    Recruiter Email
                    </InputLabel>
                )}
                <Select
                    labelId="recruiterEmail-label"
                    id="recruiterEmail"
                    name="recruiterEmails"
                    value={
                    formData.recruiterEmails.length > 0
                        ? formData.recruiterEmails
                        : []
                    }
                    onChange={handleChange}
                    required
                    multiple
                >
                    {recruiterEmails.map((email, index) => (
                    <MenuItem key={index} value={email.email}>
                        {email.email}
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>
                <FormControl fullWidth style={{ marginBottom: "20px" }}>
                {formData.interviewerEmails.length === 0 && (
                    <InputLabel
                    id="interviewerEmail-label"
                    style={{ position: "absolute", left: "15px", transform: "translate(0, 50%)"}}
                    >
                    Interviewer Email
                    </InputLabel>
                )}
                <Select
                    labelId="interviewerEmail-label"
                    id="interviewerEmail"
                    name="interviewerEmails"
                    value={
                    formData.interviewerEmails.length > 0
                        ? formData.interviewerEmails
                        : []
                    }
                    onChange={handleChange}
                    required
                    multiple
                >
                    {interviewerEmails.map((email, index) => (
                    <MenuItem key={index} value={email.email}>
                        {email.email}
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>
 
                <TextField
                    id="endTime"
                    name="endTime"
                    label="Valid Till"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    style={{ marginBottom: "20px" }}
                    onChange={handleChange}
                    // Set the min attribute to the current date
                    inputProps={{ min: new Date().toISOString().split("T")[0] }}
                    value={formData.endTime}
                />


                <Dialog
                    open={showSuccessDialog}
                    onClose={handleCloseSuccessDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Job Description Saved Successfully!"}</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" style={{ textAlign: "center" }}>
                            Your job description has been saved successfully.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseSuccessDialog} color="primary" autoFocus>
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>

<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '250px' }}>
    <Button type="submit" variant="contained" sx={{ backgroundColor: "rgba(79, 55, 139, 1)", borderRadius: '20px' }}>
        {jd ? "Update JD" : "Create"}
    </Button>
</Box>

            </form>
        </div>
    );
}
 
export default JobDescriptionForm;
 