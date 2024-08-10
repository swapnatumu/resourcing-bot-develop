
import React, { useState, useEffect } from "react";
import { Button, Snackbar,CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box,Typography, IconButton, TableCell,TableContainer,Paper,Table,TableBody,TableHead,TableRow} from '@mui/material';
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../styles/JDDetails.css';
import '../../styles/HiringdashBoard.css';
import JobDescriptionForm from "../HiringManager/JobDescriptionForm";
import Pagination from "../../utils/Pagination";
import CandidateData from './CandidateData.js';
import ScreeningTestDetails from "./ScreeningTestDetails.js";


const JDDetails = ({ hiringManagerEmail, jdDetails, userRole }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [jds, setJds] = useState([]);
    const [selectedJD, setSelectedJD] = useState(null);
    const [activeTab, setActiveTab] = useState("");
    const [isEditJDOpen, setIsEditJDOpen] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [candidateProfiles, setCandidateProfiles] = useState([]);
    const [hiringManagerEmails, setHiringManagerEmail] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
// UploadScreeing Test
const [loadingUploadScreeningTestMap, setLoadingUploadScreeningTestMap] = useState({});
const [uploadSuccessMap, setUploadSuccessMap] = useState({});
// const [screeningIDs, setScreeningIDs] = useState("");
const [screeningIDs, setScreeningIDs] = useState(() => {
  const storedScreeningIDs = localStorage.getItem('screeningIDs');
  return storedScreeningIDs ? JSON.parse(storedScreeningIDs) : {};
});

const uploadScreeningTestApiURL =process.env.REACT_APP_UPLOAD_SCREENING_TEST_API;

//search candidates
const extractjobdetailsApiUrl=process.env.REACT_APP_EXTRACT_JOB_DETAILS_API;
const craeteCandidateApiUrl = process.env.REACT_APP_CREATE_CANDIDATE_API;
const [summaries, setSummaries] = useState([]);
const [loadingSearchCandidatesMap, setLoadingSearchCandidatesMap] = useState({});
const [isViewJdDetailsOpen, setIsViewJdDetailsOpen] = useState(false);
const [resumeData, setResumeData] = useState(null);

// candidateData page open 
const [selectedCandidateId, setSelectedCandidateId] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false); 
const [showCandidateData, setShowCandidateData] = useState(false);
const [candidateEmail, setCandidateEmail] = useState("");
const [overallStatus, setOverAllStatus] = useState('');
// Screeining TestDetails page open
const [showScreeningDetails, setShowScreeningDetails] = useState(false);
const [screeningID, setCurrentScreeningID] = useState(null);
//pagination
    const itemsPerPage = 5;
    const totalPages = Math.ceil(candidateProfiles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    useEffect(() => {
        if (jdDetails && jdDetails._id) {
            fetchCandidateProfiles(jdDetails._id);
        }
    }, [jdDetails]);
    

    const fetchCandidateProfiles = async (jdId) => {
      console.log("Fetching candidate profiles:", jdId);
      try {
          const response = await axios.get(`${process.env.REACT_APP_CANDIDATE_PROFILE_BY_JDID_API}/${jdId}`);
          setCandidateProfiles(response.data);
      } catch (error) {
          if (error.response && error.response.status === 404) {
              console.log('No candidate profiles found for this JD.');
              setCandidateProfiles([]); 
          } else {
              console.error('Failed to fetch candidate profiles:', error);
              setCandidateProfiles([])
          }
      }
  };
  
   
// to open editpage with filled data
  const fetchJds = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_FETCH_JDS_API}=${hiringManagerEmail}`);
      setJds(response.data.activeJds);
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
    }
  };
    const handleEditClick = (selectedJD,hiringManagerEmail) => {
      setIsEditJDOpen(true); 
      setSelectedJD(selectedJD);
      setHiringManagerEmail(hiringManagerEmail); 
      setActiveTab('')
    };


    const handleDelete = async (jdId) => {
      console.log("delete job description:", jdId);
        try {
            await axios.put(`${process.env.REACT_APP_DELETE_JD_API}/${jdId}`);
            setSnackbarMessage('Job description deleted successfully');
            setSnackbarOpen(true);
            navigate("/hiring-dashboard", {
                state: {
                    hiringManagerEmail,
                },
            });
        } catch (error) {
            console.error('Failed to delete job description:', error);
        }
        setOpenDeleteDialog(false);
    };

    const handleOpenDeleteDialog = () => {
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };


    useEffect(() => {
      // Fetch the screening ID when the component mounts
      const fetchScreeningID = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_GET_SCREENING_ID_API}/${jdDetails._id}`);
          if (response.data && response.data.ScreeningID) {
            setScreeningIDs((prevState) => {
              const newScreeningIDs = { ...prevState, [jdDetails._id]: response.data.ScreeningID };
              localStorage.setItem('screeningIDs', JSON.stringify(newScreeningIDs));
              return newScreeningIDs;
            });
          }
        } catch (error) {
          console.error('Error fetching screening ID:', error);
        }
      };
  
      if (!screeningIDs[jdDetails._id]) {
        fetchScreeningID();
      }
    }, [jdDetails._id]);
  
    const handleUploadScreeningTest = async (jdDetails) => {
      console.log('Upload screening test front jdDetails line 141:', jdDetails);
      setLoadingUploadScreeningTestMap((prevState) => ({
        ...prevState,
        [jdDetails._id]: true,
      }));
  
      try {
        const requestData = {
          jdId: jdDetails._id,
          job_role: jdDetails.jobRole,
        };
        console.log('jdDetails line 151:', requestData);
        const response = await fetch(uploadScreeningTestApiURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          credentials: 'include',
        });
        console.log('jdDetails line 160 backend response:', response);
        if (response.ok) {
          const data = await response.json();
          console.log('Screening test upload response:', data);
  
          if (data.success) {
            setUploadSuccessMap((prevState) => ({
              ...prevState,
              [jdDetails._id]: true,
            }));
  
            setScreeningIDs((prevState) => {
              const newScreeningIDs = { ...prevState, [jdDetails._id]: data.ScreeningID };
              localStorage.setItem('screeningIDs', JSON.stringify(newScreeningIDs));
              return newScreeningIDs;
            });
          } else {
            throw new Error('Failed to upload screening test.');
          }
        } else {
          throw new Error(`Failed to upload screening test for Job role: ${jdDetails.jobRole}. Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error uploading screening test:', error.message);
  
        setUploadSuccessMap((prevState) => ({
          ...prevState,
          [jdDetails._id]: false,
        }));
      } finally {
        setLoadingUploadScreeningTestMap((prevState) => ({
          ...prevState,
          [jdDetails._id]: false,
        }));
      }
    };
  
    const handleUploadClick = async () => {
      await handleUploadScreeningTest(jdDetails);
    };
  
    const handleViewScreeningClick = async () => {
      const screeningID = screeningIDs[jdDetails._id];
      if (screeningID) {
        try {
          await axios.post(`${process.env.REACT_APP_SCREENING_ID_API}/${screeningID}`, { screeningID });
  
          setCurrentScreeningID(screeningID);
          setShowScreeningDetails(true);
        } catch (error) {
          console.error('Error sending screening ID to backend:', error);
        }
      }
    };
  

    const handleBack = () => {
        if (location.state && location.state.fromEditJobDescription) {
          navigate(-1); 
        } else {
          navigate(-0); 
        }
    };

    if (!jdDetails) {
        return <div>Loading...</div>;
    }
    const renderStatusIndicator = (overallStatus) => {
      console.log('Overall Status:', overallStatus);
      if (overallStatus === 'RecruiterScreenAccept' || overallStatus === 'NewCandidate') {
        return (
          <Typography variant="caption" 
          sx={{ position: 'absolute', top: -10, right: -20,backgroundColor: ' yellow',width: '50px',  height: '20px',display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px',padding: '2px'}}>
            New
          </Typography>
        );
      }
      return null;
    };

    const handlebuttonclick1= (candidateId,candidateEmail,overallStatus) => {
      console.log("candidateprofile line 242:",candidateId,candidateEmail,overallStatus);
      console.log("user", overallStatus)
        if (!candidateId) {
          console.error('Candidate ID is undefined');
          return;
        }
        console.log('Candidate ID:', candidateId);
        setSelectedCandidateId(candidateId);
        setCandidateEmail(candidateEmail);
        setOverAllStatus(overallStatus);
        setIsModalOpen(true);
        setShowCandidateData(true);
      };
      const handleClose = () => {
        setSelectedCandidateId(null);
        setShowCandidateData(false); 
      };


      const handleSearchCandidates = async (jd) => {
        setLoadingSearchCandidatesMap(prevState => ({
                ...prevState,
                [jd._id]: true
            }));
        try {
          const requestData = {
            job_description: jd.jobDescription,
            job_role: jd.jobRole,
            skills: jd.skills,
            experience: jd.experience,
            jddetails_id: jd._id
          };
    
          const response = await axios.post(
            extractjobdetailsApiUrl,
            requestData
          );
          console.log("response.data..", response.data);
    
          const documentSummaries = response.data.document_summaries;
          console.log("type: " ,documentSummaries)
    
          for (const documentSummary of documentSummaries) {
            // Ensure documentSummary and its nested properties are defined
            if (documentSummary && documentSummary.content && documentSummary.content.metadata) {
              const source = documentSummary.content.metadata.source;
              console.log("Source:", source);
              const resumeData = {
                resumeUrl: source,  
                extracted_email: documentSummary.content.extracted_email,
                extracted_phone_number: documentSummary.content.extracted_phone_number, 
                jobDetailsId: jd._id,
                extracted_name: documentSummary.content.extracted_name,
                address: '1233',
                summaries: documentSummary.summary,
              };
                console.log("resumeData...", resumeData)
                const response2 = await fetch(craeteCandidateApiUrl, {            
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(resumeData),
                });
              }
            }
          
           setResumeData({
              jdId: jd._id,
              summaries: summaries
            });
            // Set state to show job description details page
        setIsViewJdDetailsOpen(true);
        setSelectedJD({ ...jd, userRole: 'recruiter' });
            alert('Search completed successfully.');
        }
         catch (error) {
          console.error("Error fetching resumes from the model:", error);
          window.alert("Failed to fetch resumes from the model.");
        } finally{
          setLoadingSearchCandidatesMap(prevState => ({
                    ...prevState,
                    [jd._id]: false
                }));
        }
      };
      

// Filter the profiles based on the userRole
const filteredProfiles = candidateProfiles.filter(profile => 
  userRole === 'interviewer' ? profile.overallStatus === 'InterviewScheduled' : true
);
const selectedProfiles = candidateProfiles.filter(profile => filteredProfiles.includes(profile));

// filtering the new candidates
const newCandidatesCount = filteredProfiles.filter(profile => 
  profile.overallStatus === 'RecruiterScreenAccept' || profile.overallStatus === 'NewCandidate'
).length;

  // Filtering selectedProfiles based on filteredProfiles
const displayedProfiles = selectedProfiles.filter(profile => filteredProfiles.includes(profile));

const sortedProfiles = displayedProfiles.sort((a, b) => {
  const aIsNew = a.overallStatus === 'RecruiterScreenAccept' || a.overallStatus === 'NewCandidate';
  const bIsNew = b.overallStatus === 'RecruiterScreenAccept' || b.overallStatus === 'NewCandidate';
  return bIsNew - aIsNew;
});

const paginatedProfiles = sortedProfiles.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="jd-details" style={{justifyContent:'flex-start',alignItems:'flex-start'}}>  
          {showScreeningDetails ? (
                <ScreeningTestDetails screeningID={screeningIDs[jdDetails._id]} />
            ) : (   
          
            !isEditJDOpen && !showCandidateData && (
            <React.Fragment>
            <IconButton onClick={handleBack} style={{ position: "absolute",alignItems: 'center',justifyContent: 'center', color: "black", top: '100px' }}>
                <ArrowBackIcon style={{ fontSize: "50px" }} />
            </IconButton>
 
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '85%',marginTop:'100px' }}>
                <Typography
                    variant="h5"
                    style={{
                        width: '70%',
                        marginTop: '20px',
                        color: "black",
                        fontFamily: 'Righteous',
                        fontSize: '40px',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(232, 222, 248, 1)',
                        display: 'flex',
                        alignItems: 'center',
                       justifyContent: 'center',
                        height: '100px',
                        borderRadius: '20px',
                        padding: '0 20px', 
                    }}
                >
                    <span style={{ marginLeft: '50px' }}>JD ID:</span>
                    <span >({jdDetails.jdID})</span>
                </Typography>

<div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '20px' }}>
  {userRole !== 'interviewer' && (
    <Typography variant="h5" style={{ color: "black", fontFamily: 'Righteous', fontSize: '40px', fontWeight: 'bold' }}>
      Actions:
    </Typography>
 )}

  {userRole === 'hiringManager' && (
      <div>
        <Button onClick={() => handleEditClick(jdDetails,hiringManagerEmail)} >
        <button className="allbuttons-btn"> Edit JD</button>       
        </Button>
       <Button onClick={handleOpenDeleteDialog}>
       <button className="allbuttons-btn"> Delete JD</button>
       </Button>
      </div>
  )}

  {userRole === 'recruiter' && (
    <div style={{ display: 'flex', gap: '20px', height: '40px' }}>
{loadingUploadScreeningTestMap[jdDetails._id] ? (
        <CircularProgress size={24} />
      ) : (
        screeningIDs[jdDetails._id] ? (
          <span>{screeningIDs[jdDetails._id]}</span>
        ) : (
          <Button onClick={handleUploadClick} disabled={loadingUploadScreeningTestMap[jdDetails._id]}>
            <button className="allbuttons-btn">Upload Screening Test</button>
          </Button>
        )
      )}
      {screeningIDs[jdDetails._id] && (
        <Button onClick={handleViewScreeningClick}>
          <button className="allbuttons-btn">View Screening</button>
        </Button>
      )}
      <Button onClick={() => handleSearchCandidates(jdDetails)} disabled={loadingSearchCandidatesMap[jdDetails._id]}>
        {loadingSearchCandidatesMap[jdDetails._id] ? <CircularProgress size={24} /> : <button className="allbuttons-btn">Search Candidates</button>}
      </Button>
    </div>
  )}
</div>
 <br></br>

                <div className="details" style={{ border: '5px solid rgba(232, 222, 248, 1)', padding: '20px', borderRadius: '10px',borderRadius:"30px",}}>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '50px', width: '100%',alignItems: 'center',justifyContent: 'center'}}>
                    <Button style={{ backgroundColor: 'rgba(232, 222, 248, 1)', border: '0.5px solid rgba(79, 55, 139, 1)', borderRadius: '20px', color: "rgba(79, 55, 139, 1)" }}>
                        Creation Date: {new Date(jdDetails.creation_time).toLocaleDateString()}
                    </Button>
                    <Button style={{ backgroundColor: 'rgba(232, 222, 248, 1)', border: '0.5px solid rgba(79, 55, 139, 1)', borderRadius: '20px', color: "rgba(79, 55, 139, 1)" }}>
                        Expiration Date: {new Date(jdDetails.expiration_time).toLocaleDateString()}
                    </Button>
                   
                </div>
                <Typography style={{ color: "rgba(79, 55, 139, 1)" ,fontSize:'20px'}}>
                    <strong>Job Role:</strong> {jdDetails.jobRole}
                </Typography><br></br>
                <div style={{ marginBottom: '50px' }}>
                    <strong>Job Description:</strong> {jdDetails.jobDescription}
                </div>
                <div style={{ marginBottom: '50px' }}>
                    <strong>Primary Skills:</strong> {jdDetails.skills ? jdDetails.skills.join(', ') : ''}
                </div>
                <div style={{ marginBottom: '40px' }}>
                    <strong>Secondary Skills:</strong> {jdDetails.secondarySkills ? jdDetails.secondarySkills.join(', ') : ''}
                </div>
                <div style={{ marginBottom: '40px' }}>
                    <strong>Experience Required:</strong> {jdDetails.experience}
                </div>
                <div style={{ marginBottom: '40px' }}>
                    <strong>Salary Range:</strong> {jdDetails.salaryRange}
                </div>
                <div style={{ marginBottom: '40px' }}>
                    <strong>Recruiter Details:</strong>
                    {jdDetails.recruiterContacts && jdDetails.recruiterContacts.map((recruiter, index) => (
                        <span key={recruiter.email}>
                            {recruiter.email}
                            {index < jdDetails.recruiterContacts.length - 1 && ", "}
                        </span>
                    ))}
                    {jdDetails.recruiterContacts && jdDetails.recruiterContacts.length > 0 && <span>{"\u00A0"}</span>}
                </div>
                <div style={{ marginBottom: '40px' }}>
                    <strong>Interviewer Details:</strong>
                    {jdDetails.interviewerContacts && jdDetails.interviewerContacts.map((interviewer, index) => (
                        <span key={interviewer.email}>
                            {interviewer.email}
                            {index < jdDetails.interviewerContacts.length - 1 && ", "}
                        </span>
                    ))}
                    {jdDetails.interviewerContacts && jdDetails.interviewerContacts.length > 0 && <span>{"\u00A0"}</span>}
                </div>
                <div style={{ marginBottom: '40px' }}>
                    <strong>Status:</strong> {jdDetails.is_active ? 'Active' : 'Inactive'}
                </div>
            </div>
<br></br><br></br>

<Box sx={{ padding: '10px', display: 'flex', alignItems: 'center', marginTop: '40px', backgroundColor: 'rgba(232, 222, 248, 1)', width: '55%', borderRadius: '20px' }}>
  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
    {filteredProfiles.length}
  </Typography>
  <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)', marginRight: '30px' }}>
    Candidates have applied
  </Typography>
  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
    {newCandidatesCount}
  </Typography>
  <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)' }}>
    New Candidates
  </Typography>
</Box>
<br />

{(userRole === 'interviewer' || userRole === 'recruiter' || userRole === 'hiringManager') ? (
      paginatedProfiles.length > 0 ? (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ width: '100%', margin: 'auto', border: '1px solid lightgray', borderCollapse: 'collapse' }}>
          <TableRow sx={{ backgroundColor: 'rgba(79, 55, 139, 1)', border: '1px solid lightgray', color: 'white' }}>
            <TableCell className="table-header-cell" style={{width:"17%"}}><strong>Candidate ID</strong></TableCell>
            <TableCell className="table-header-cell"><strong>Status</strong></TableCell>
            <TableCell className="table-header-cell"><strong>Name</strong></TableCell>
            <TableCell className="table-header-cell"><strong>Job Role</strong></TableCell>
            <TableCell className="table-header-cell"><strong>Email</strong></TableCell>
            <TableCell className="table-header-cell"><strong>Phone</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>            
            {paginatedProfiles
              .filter(profile => !(userRole === 'hiringManager' && profile.overallStatus === 'NewCandidate'))
              .map((profile) => (
            <TableRow key={profile._id}>
              <TableCell className="candidateProfiletable-cell">
   <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Button
        onClick={() => handlebuttonclick1(profile._id, profile.candidateEmail, profile.overallStatus)}
        sx={{ textDecoration: 'underline', ':hover': { textDecoration: 'underline' } }}
      >
        {profile.candidateID}
      </Button>
      {renderStatusIndicator(profile.overallStatus)}
    </Box>
              </TableCell>
              <TableCell>{profile.overallStatus}</TableCell>
              <TableCell>{profile.candidatename}</TableCell>
              <TableCell>{profile.jobRole}</TableCell>
              <TableCell>{profile.candidateEmail}</TableCell>
              <TableCell>{profile.phone}</TableCell>
            </TableRow> 
          ))}
        </TableBody>
      </Table>
      <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} totalPages={totalPages} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} />
    </TableContainer>
  ) : (
    <Typography variant="body1">No candidate profiles found for this job description.</Typography>
  )
) : null}

<br></br>
<br></br><br></br><br></br>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />


            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Delete Job Description</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this job description?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleDelete(jdDetails._id)} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            </div>
        </React.Fragment>
        ))
      }
        {isEditJDOpen && (
            <JobDescriptionForm
          jd={selectedJD}
          isEdit={isEditJDOpen}
          hiringManagerEmail={hiringManagerEmail} 
          onClose={() => {
            setIsEditJDOpen(false);
          }}
          onSnackbarOpen={() => {
          }}
          fetchJds={isEditJDOpen ? fetchJds : undefined} 
        />
        )}

{showCandidateData && (
      <CandidateData candidateId={selectedCandidateId} 
      userRole={userRole} 
      candidateEmail={candidateEmail} 
      overallStatus={overallStatus}
      jdId={jdDetails._id}
      onClose={handleClose} />
    )}
</div>
    );
};

export default JDDetails;













