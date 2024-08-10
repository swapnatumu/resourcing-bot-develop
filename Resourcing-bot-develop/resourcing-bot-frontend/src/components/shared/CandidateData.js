




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate,useLocation,useParams} from 'react-router-dom';
import { Button, Typography, DialogTitle,Dialog,DialogActions,DialogContent,Toolbar,TextField, Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow,IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchedulingPage from '../Recruiter/SchedulingPage';
import FeedbackForm from '../Interviewer/FeedBackForm';

const CandidateData = ({ candidateId ,userRole,candidateEmail,overallStatus,jdId}) => {

  const [candidateData, setCandidateData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const { id } = useParams();

const baseUrl= process.env.REACT_APP_GET_CANDIDATE_PROFILE_DATA_API
const baseUrl2= process.env.REACT_APP_GET_UPLOADED_DOCUMENTS_API
const candidateProfiledataApi = `${baseUrl}/${candidateId}`;
const uploadeddocumentsApi=`${baseUrl2}/${document.filename}`;

  const toggleFeedback = () => {
    setIsFeedbackOpen(!isFeedbackOpen);
  };

  const toggleDocuments = () => {
    setIsDocumentsOpen(!isDocumentsOpen);
  };











  useEffect(() => {
    if (!candidateId) {
      console.error('Candidate ID is undefined');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
       
        const response = await axios.get(candidateProfiledataApi);
        setCandidateData(response.data.candidate);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [candidateId]);



// hm_resume display page code
const [errorMessages, setErrorMessages] = useState({});
const [candidateProfile, setCandidateProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [openDialog, setOpenDialog] = useState(false);
const [feedback, setFeedback] = useState('');
const [actionType, setActionType] = useState('');
const baseUrl3 = process.env.REACT_APP__CANDIDATE_PROFILE_API;
const candidateProfileApi = `${baseUrl}/${candidateId || id}`; 

const updateCandidateStatusHmScreeningApi = `${baseUrl3}/${candidateId}/updateStatus`;
const getpdfApiUrl = process.env.REACT_APP_GET_PDF_API;
const holdId= process.env.REACT_APP_UPDATE_HOLD_HM_SCREENING_API
const updateCandidateStatusHmScreeningApihold = `${holdId}/${candidateId}/updateStatus`;



useEffect(() => {
  const fetchCandidateProfile = async (candidateId) => {
    try {
      const response = await axios.get(candidateProfileApi);
     
      console.log('candidate data line 85 response ::', response);


      console.log('Fetched candidate profile:', response.data.candidate.overallStatus);
      setCandidateProfile(response.data.candidate);

    } catch (error) {
      console.error('Error fetching candidate profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (candidateId || id) {
    fetchCandidateProfile();
  }
}, [candidateId, id]);


useEffect(() => {
  console.log('Current candidateProfile:', candidateProfile);
}, [candidateProfile]);

useEffect(() => {
  console.log('Current overallStatus:', overallStatus);
}, [overallStatus]);


useEffect(() => {
  console.log("Dialog open state changed:", openDialog);
}, [openDialog]);


const handleResumedisplay = async (filename) => {
  try { 
    console.log("handleResumedisplay fileName", filename);

      const response = await axios.get(`${getpdfApiUrl}=${filename}`, {
        responseType: 'arraybuffer',
      });
console.log("candidatedata line 135:", response)
      if (response.status === 200) {
        const resumeBlob = new Blob([response.data], { type: 'application/pdf' });
        const resumeUrl = URL.createObjectURL(resumeBlob);
        window.open(resumeUrl, '_blank');

      } else {
        window.alert('Failed to fetch resume from the backend API.');
      }
    } catch (error) {
    console.error('Error fetching resumes from backend:', error);
    window.alert('Failed to fetch resumes from the backend API.');
  }
};

const handleFeedbackChange = (event) => {
  setFeedback(event.target.value);
};

const handleButtonClick = (action) => {
  setActionType(action);
  setOpenDialog(true);
  console.log("Dialog should open now with action:", action);
};

const handleSubmit = async () => {
  if (!candidateProfile || !candidateProfile._id) {
    console.error('candidateProfile is undefined or missing _id');
    return;
  }
  // Validate feedback length
  if (feedback.split(/\s+/).length < 2 || feedback.split(/\s+/).length > 50) {
    setErrorMessages((prevMessages) => ({
      ...prevMessages,
      [candidateProfile._id]: 'Reason must be between 2 and 50 words.',
    }));
    return;
  } else {
    setErrorMessages((prevMessages) => ({
      ...prevMessages,
      [candidateProfile._id]: '',
    }));
  }

  try {
    // Prepare the request payload with user role
    const data = { action: actionType, feedback, userRole }; 
    // Make API request
    await axios.post(updateCandidateStatusHmScreeningApi, data);

    // Determine updated status based on actionType
    let updatedStatus;
    if (userRole === 'hiringManager') {
      if (actionType === 'accept') {
        updatedStatus = 'HiringManagerScreenAccepted';
      } else if (actionType === 'reject') {
        updatedStatus = 'HiringManagerScreenRejected';
      } else if (actionType === 'on_hold') {
        updatedStatus = 'HiringManagerHold';
      }
    } else if (userRole === 'recruiter') {
      if (actionType === 'accept') {
        updatedStatus = 'RecruiterScreenAccept';
      } else if (actionType === 'reject') {
        updatedStatus = 'RecruiterScreenReject';
      } else if (actionType === 'on_hold') {
        updatedStatus = 'RecruiterScreenHold';
      }
    }
    // Update the candidate profile state with the appropriate feedback field
    setCandidateProfile((prevProfile) => ({
      ...prevProfile,
      ResumeStatus: updatedStatus,
      [userRole === 'hiringManager' ? 'hiringManagerFeedback' : 'recruiterFeedback']: feedback
    }));
  } catch (error) {
    console.error(`Error ${actionType === 'accept' ? 'accepting' : actionType === 'reject' ? 'rejecting' : 'putting on hold'} candidate profile:`, error);
  } finally {
    setOpenDialog(false);
    setFeedback('');
    setActionType('');
  }
};

// userrole=hiringManager
const [profiles, setProfiles] = useState([]);
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');

const statusesForUnhold = ['Hold','HiringManagerHold','Hold_TestPassed','Selected_hold'];

const statusesForHold = ['RecruiterScreenHold','HiringManagerScreenAccepted','TestPassed','Selected'];

const handleUpdateStatus = async (candidateId, action, feedback) => {
  try {
      const data = { action, feedback };
      // Make a POST request to update the status with the provided feedback
      const response = await axios.post(updateCandidateStatusHmScreeningApihold, data); 
      // Extract the new status from the response
      const { newStatus } = response.data;
      // Update the local state to reflect the changes
      setProfiles((prevProfiles) =>
          prevProfiles.map((profile) =>
              profile._id === candidateId ? { ...profile, overallStatus: newStatus } : profile
          )
      );
  } catch (error) {
      console.error('Error updating candidate status:', error);
      setSnackbarMessage('Failed to update candidate status');
      setSnackbarOpen(true);
  }
};

const handleUnhold = (candidateId) => {
  handleUpdateStatus(candidateId, 'unhold', 'Unhold');
};


const buttonConfigs = [
  { status: 'Accepted', label: 'Accept', action: 'accept', className: 'accept-btn'},
  { status: 'Rejected', label: 'Reject', action: 'reject', className: 'reject-btn' },
  { status: 'On Hold', label: 'Hold', action: 'on_hold', className: 'on-hold-btn' }
];


const renderButtons = () => {
  if (!candidateProfile || !candidateProfile.overallStatus) {
     return null;
  }

  const sharedActions = ['accept', 'reject', 'on_hold'];
  const buttonFilter = {
    'HiringManagerScreenAccepted': ['reject'],
    'HiringManagerScreenRejected': ['accept', 'on_hold'],
    'HiringManagerHold': ['accept', 'reject'],
    'RecruiterScreenAccept': sharedActions,
    'NewCandidate': sharedActions
  };

  const visibleActions = buttonFilter[candidateProfile.overallStatus] || [];

  return (
    <>
      {buttonConfigs
        .filter(({ action }) => visibleActions.includes(action))
        .map(({ label, action, className }) => (
          <button 
            key={action} 
            className={className} 
            onClick={() => handleButtonClick(action)}
            disabled={candidateProfile.ResumeStatus === label} >
            {label}
          </button>
        ))}
    </>
  );
};



//Resumedisplay page if the  userrole=recruiter 

const [showScheduleInterface, setShowScheduleInterface] = useState(false);
const [scheduleCandidateEmail, setScheduleCandidateEmail] = useState('');
const [scheduleJdId, setScheduleJdId] = useState('');
const [interviewers, setInterviewers] = useState('');
const [recruiters, setRecruiterEmail] = useState('');
const [loadingMap, setLoadingMap] = useState({});
const [successMap, setSuccessMap] = useState({});

const screeningtestApiUrl = process.env.REACT_APP_SCREENING_TEST_API;

const [showFeedbackForm, setShowFeedbackForm] = useState(false);
const [selectedCandidateEmail, setSelectedCandidateEmail] = useState('');
const handleCloseFeedbackForm = () => setShowFeedbackForm(false);


const handleScreening = async (candidateEmail, jdId, index, recruiterEmails) => {
  setLoadingMap({ ...loadingMap, [index]: true }); // Start loading for the selected row

  try {

      const emailResponse = await axios.post(screeningtestApiUrl, {
        // const emailResponse = await axios.post("http://127.0.0.1:5008/screening_test_email", {
          email: candidateEmail,
          jdId: jdId,
          recruiterContacts: recruiterEmails 
      });

      if (emailResponse.status === 200) {
        console.log("done")
          setSuccessMap({ ...successMap, [index]: true }); 
          alert('Screening Test sent successfully');
      } else {
          console.error('Failed to schedule email:', emailResponse.data.message);
      }
  } catch (error) {
      console.error('Error scheduling email:', error);
  }
finally{
  setLoadingMap({ ...loadingMap, [index]: false }); 
  window.location.reload();
}
}

const handleScheduleClick = (candidateEmail, jdId,interviewerEmails,recruiterEmails) => {
  setScheduleCandidateEmail(candidateEmail);
  setScheduleJdId(jdId);
  setInterviewers(interviewerEmails); 
  setRecruiterEmail(recruiterEmails);
  setShowScheduleInterface(true);
};


const buttonConfigsRecruiter = {
  'HiringManagerScreenAccepted': { label: 'Screening', action: 'screening', color: 'primary',
    onClick: (candidateEmail, jdId) => handleScreening(candidateEmail, jdId),
  },
  'RecruiterScreenHold': { label: 'Unhold', action: 'unhold', color: 'primary',
    onClick: (candidateId) => handleUnhold(candidateId),
  },

  'TestPassed': { label: 'Schedule', action: 'schedule', color: 'primary',
    onClick: (candidateEmail, jdId) => handleScheduleClick(candidateEmail, jdId),
  },
};

const renderButtonsforRecruiter = () => {
  if (userRole !== 'recruiter') {
    return null; 
  }
  const buttonConfig = buttonConfigsRecruiter[overallStatus];
  if (buttonConfig) {
    return buttonConfig.component || (
      <button
      className='allbuttons-btn'
        variant="outlined"
        color={buttonConfig.color}
        onClick={() => buttonConfig.onClick(candidateEmail, jdId)}
        disabled={buttonConfig.disabled && buttonConfig.disabled(candidateId)}
      >
        {buttonConfig.label}
      </button>
    );
  }
  return null;
};


  const renderActionLinkInterviewer = (overallStatus, userType, candidateEmail) => {
    console.log("line 363 candidatedata:", overallStatus, userType, candidateEmail)
    if (userType === 'interviewer') {
      if (overallStatus === 'InterviewScheduled') {
        return (
          <div>
            <button className='allbuttons-btn'  onClick={() => {
                setSelectedCandidateEmail(candidateEmail);
                setShowFeedbackForm(true);
              }}>Provide feedback</button>
          </div>
        );
      }
    } else {
      return null;
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!candidateData) return <div>No candidate data found.</div>;


  const handleBack = () => {
    if (location.state && location.state.fromEditJobDescription) {
      navigate(-1); 
    } else {
      navigate(-0); 
    }
};


return (
  <div style={{width:'90%',position:'relative'}}>
   
      {showFeedbackForm ? (
        <FeedbackForm showFeedbackForm={showFeedbackForm} onCloseFeedbackForm={handleCloseFeedbackForm} selectedCandidateEmail={selectedCandidateEmail} jdId={jdId}/>
      ) : showScheduleInterface ? (
        <SchedulingPage candidateEmail={scheduleCandidateEmail} jdId={jdId} recruiterEmail={recruiters} interviewerEmail={interviewers}
        />
      ) : (
        <>
    <Toolbar style={{justifyContent:'flex-start' }}>
      <IconButton onClick={handleBack} style={{ position: "absolute", top: "100px", color: "black" }}>
        <ArrowBackIcon style={{ fontSize: "50px" }} />
      </IconButton>
    </Toolbar>

    <Box style={{ justifyContent:'flex-start'}}>

                <Typography
                    variant="h5"
                    style={{  width: '100%',  marginTop: '100px',  color: "black",  fontFamily: 'Righteous',  fontSize: '40px',  fontWeight: 'bold',  backgroundColor: 'rgba(232, 222, 248, 1)',  display: 'flex',  alignItems: 'center',  justifyContent: 'center',  height: '70px',  borderRadius: '20px',  padding: '0 10px', 
                    }}>
                    <span style={{ marginLeft: '50px' }}> Candidates Details</span>
                </Typography>
                </Box>
<div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '20px' }}>
  <Typography
    variant="h5"
    style={{ color: "black", fontFamily: 'Righteous', fontSize: '40px', fontWeight: 'bold' }}>
    Actions:
  </Typography>
  <button key="viewResume" className='allbuttons-btn'
       onClick={() => handleResumedisplay(candidateProfile?.resumeUrl)}>
        View Resume
  </button>

  {userRole === 'hiringManager' && (
    <div style={{ display: 'flex', gap: '10px' }}>
        <>
    {statusesForUnhold.includes(overallStatus) && (
      <div>
        <button  variant="outlined"  className='allbuttons-btn' onClick={() => handleUnhold(candidateId)} > Unhold </button>
      </div>
    )}
    {statusesForHold.includes(overallStatus) && (
      <div>
        <button  variant="outlined"  className='allbuttons-btn'  onClick={() => handleUpdateStatus(candidateId, 'hold', 'Put on hold')}> Hold</button>
      </div>
    )}
  </>
    <div>
        {/* {renderButtons()} */}

      {overallStatus !== 'NewCandidate' && renderButtons()}
    </div>
    </div>
  )}
{userRole === 'recruiter' && (
          <div>
           {renderButtonsforRecruiter()}
           {renderButtons()}
         </div>  
      )}


<Dialog open={openDialog} onClose={() => setOpenDialog(false)} style={{width:'100%'}}>
  <DialogTitle>Provide Feedback</DialogTitle>
  <DialogContent>
    <TextField variant="outlined" placeholder="Enter Text" size="small" fullWidth required value={feedback} onChange={handleFeedbackChange} multiline rows={4}/>
      {candidateProfile && errorMessages[candidateProfile._id] && (
      <Typography color="error" variant="body2">
        {errorMessages[candidateProfile._id]}
      </Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)} color="primary">
      Cancel
    </Button>
    <Button onClick={handleSubmit} color="primary">
      Submit
    </Button>
  </DialogActions>
</Dialog>
{userRole === 'interviewer' && (
    <div style={{ display: 'flex', gap: '20px', height: '40px' }}>
      {renderActionLinkInterviewer(overallStatus, userRole,candidateEmail)}
    </div>
  )}
</div>


    <div style={{backgroundColor:'rgba(232, 222, 248, 1)'}}>
    <Box sx={{  margin: '20px auto', padding: '5px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        {/* Left Column */}
        <Box sx={{ flex: 1}}>
      
          <Paper elevation={3} style={{ padding: '20px' ,backgroundColor: 'rgba(232, 222, 248, 1)'}}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
              <p><strong>Candidate Name:</strong> {candidateData.candidatename}</p>
              <p><strong>Candidate Email:</strong> {candidateData.candidateEmail}</p>
              <p><strong>Phone:</strong> {candidateData.phone}</p>
              <p><strong>Address:</strong> {candidateData.address}</p>
              <p><strong>Job Role:</strong> {candidateData.jobRole}</p>
              <p><strong>Overall Status:</strong> {candidateData.overallStatus}</p>
              <p><strong>Recruiter Feedback:</strong> {candidateData.recruiterFeedback}</p>
              <p><strong>Hiring Manager Feedback:</strong> {candidateData.hiringManagerFeedback}</p>
            </div>
          </Paper>
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} style={{ padding: '20px'}}>
          <p><strong>Summary:</strong> {candidateData.summaries}</p>
            <strong onClick={toggleFeedback} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              Interview Feedback
              <span style={{ marginLeft: '8px', transform: isFeedbackOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
                ▶
              </span>
            </strong>
            {isFeedbackOpen && (
              <TableContainer component={Paper} style={{ marginTop: '10px' }}>
                <Table>
                  <TableBody>
                    {[
                      ['Feedback Text', candidateData.interviewFeedback?.feedbackText],
                      ['Programming Rating', candidateData.interviewFeedback?.programmingRating],
                      ['Performance Rating', candidateData.interviewFeedback?.performanceRating],
                      ['Review Rating', candidateData.interviewFeedback?.reviewRating],
                      ['Communication Skills', candidateData.interviewFeedback?.communicationSkills],
                      ['Technical Skills', candidateData.interviewFeedback?.technicalSkills],
                      ['Problem Solving Skills', candidateData.interviewFeedback?.problemSolvingSkills],
                      ['Areas Of Interest', candidateData.interviewFeedback?.areasOfInterest],
                      ['Areas Of Strength', candidateData.interviewFeedback?.areasOfStrength],
                      ['Suggestion', candidateData.interviewFeedback?.suggestion],
                    ].map(([label, value]) => (
                      <TableRow key={label}>
                        <TableCell style={{ border: '1px solid black', padding: '8px' }}><strong style={{ color: 'gray' }}>{label}:</strong></TableCell>
                        <TableCell style={{ border: '1px solid black', padding: '8px' }}>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {candidateData.interviewid && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                  <p><strong>Interview Type:</strong> {candidateData.interviewid.interviewType}</p>
                  <p><strong>Interview Status:</strong> {candidateData.interviewid.interviewStatus}</p>
                  <p><strong>Outcome:</strong> {candidateData.interviewid.outcome}</p>
                </div>
                <strong onClick={toggleDocuments} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                  Documents
                  <span style={{ marginLeft: '8px', transform: isDocumentsOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
                    ▶
                  </span>
                </strong>
                {isDocumentsOpen && (
                  <ul>
                    {candidateData.Documents.map(document => (
                      <li key={document.filename}>
                        <strong>Filename:</strong> <a href={`${uploadeddocumentsApi}/${document.filename}`} target="_blank" rel="noopener noreferrer">{document.filename}</a><br />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </Paper>
        </Box>
      </div>
    </Box>

    </div>
    </>
      )}
  </div>
  
);
};

export default CandidateData;












