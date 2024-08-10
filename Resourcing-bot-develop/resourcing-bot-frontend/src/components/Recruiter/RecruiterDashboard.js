

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Box, Avatar, AppBar, Toolbar, IconButton, CssBaseline } from '@mui/material';
import styled from 'styled-components';

import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import WidgetsIcon from "@mui/icons-material/Widgets";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BarChartIcon from "@mui/icons-material/BarChart";
import Divider from '@mui/material/Divider';
import ProfileForm from '../shared/Profileform.js';
import CandidateProfiles from '../shared/CandidateProfile.js';
import Pagination from  '../../utils/Pagination.js';
import JDDetails from "../shared/JDDetails.js";
import '../../styles/HiringdashBoard.css'
import ResumeDisplay from "./ResumeDisplay.js"


const Container = styled.div`
  display: flex;
  overflow-y: auto;
`;


const CenteredSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

`;

const ScrollableContent = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  position: absolute;
`;
const StyledAvatar = styled(Avatar)`
  background-color: rgba(79, 55, 139, 1);
  margin-right: 10px;
`;

const StyledPaper = styled(Paper)`
  box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-left: 150px;
  width: 80%;
  margin-top:100px;
`;

const StyledTable = styled(Table)`
  min-width: 650px;

  & thead th {
 
    background-color: rgba(79, 55, 139, 1);
    color: #ffffff;
    font-weight: bold;
  }

  & tbody tr:hover {
    background-color: #f5f5f5;
  }

  & th, & td {
    padding: 16px;
  }
`;

const ScrollableTableContainer = styled(TableContainer)`
  // height: calc(100vh - 250px);
  height:50%;
  overflow-y: auto;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20%;
  background-color: rgba(232, 222, 248, 1);
  height: 100vh;
  align-items: flex-start;
  padding: 50px;

`;

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'lightgray',
    width: '100%',
    height: '5%',
    borderRadius: '15px',
  },
}));

function RecruiterDashboard() {
  const [jds, setJds] = useState([]);
	const navigate = useNavigate();
  const location = useLocation();
  const { email, name, phone, userType} =  useLocation().state || {};
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("RecruiterDashboard");

	const uploadScreeningTestApiURL =process.env.REACT_APP_UPLOAD_SCREENING_TEST_API;
	const extractjobdetailsApiUrl=process.env.REACT_APP_EXTRACT_JOB_DETAILS_API;
  const logoutApiUrl = process.env.REACT_APP_LOGOUT_API;
  const craeteCandidateApiUrl = process.env.REACT_APP_CREATE_CANDIDATE_API;
  const getpdfApiUrl=process.env.REACT_APP_GET_PDF_API || "http://127.0.0.1:5005/get_pdf?fileName";
  const scheduledCandidateDetailsApiUrl = process.env.REACT_APP_SCHEDULED_CANDIDATE_DETAILS_API;

	const [summaries, setSummaries] = useState([]);
	const [loadingSearchCandidatesMap, setLoadingSearchCandidatesMap] = useState({});
  const [showCandidateProfiles, setShowCandidateProfiles] = useState(false);
  const [selectedCandidateProfileId, setSelectedCandidateProfileId] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const { initialScreeningIds} =  useLocation().state || {};
  const [screeningIDs, setScreeningIDs] = useState(initialScreeningIds || '');
  const [selectedJD, setSelectedJD] = useState(null);
  const [isViewJdDetailsOpen, setIsViewJdDetailsOpen] = useState(false);
  const [resumeData, setResumeData] = useState(null);
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 5;
 
   const totalPages = Math.ceil(jds.length / itemsPerPage);
 
   const handlePrevPage = () => {
     setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
   };
 
   const handleNextPage = () => {
     setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
   };
 
   const displayedJds = jds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 
  const handleViewCandidateProfiles = (jdId) => {
    console.log('JD ID:', jdId); 
    if (jdId) { 
      setShowCandidateProfiles(true);
      setSelectedCandidateProfileId(jdId);
      setSelectedUserType(userType);
      setActiveTab('');
    }
  };
  useEffect(() => {
    if (name && phone && email && userType) {
      // Only set userData if all values are present
      setUserData({ name, phone, email,userType });
    }
  }, [name, phone, email,userType]);

  useEffect(() => {
    if (location.state && location.state.jds) {
      setJds(location.state.jds);
    }
  }, [location.state]);
 

  const [data, setData] = useState([]);

  const fetchScheduledInterviews = async (email) => {
    console.log("Fetching for email:", email);
    sessionStorage.setItem('activeTab', 'Scheduled'); 
    window.location.reload(); 
  
    try {
      const response = await axios.get(scheduledCandidateDetailsApiUrl, {
        params: { email: email }
      });
      console.log('Scheduled Interviews:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching scheduled interviews:', error);
    }
  };

  useEffect(() => {
    const savedActiveTab = sessionStorage.getItem('activeTab');
    if (savedActiveTab) {
      setActiveTab(savedActiveTab);
      sessionStorage.removeItem('activeTab'); 
    }
  }, []);

  const handleProfileTabClick = () => {
    sessionStorage.setItem('activeTab', 'profile');
    window.location.reload();
  };


  const handleLogout = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in localStorage');
            return;
        }
        const response = await axios.post(logoutApiUrl, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(response.data.message);
        localStorage.removeItem('token');
        navigate('/');
    } catch (error) {
        console.error('Error logging out:', error.response?.data.message || error.message);
    }
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
        let resumeData = {};
        if (documentSummary && documentSummary.content && documentSummary.content.metadata) {
          const source = documentSummary.content.metadata.source;
  
          console.log("Source:", source);
          resumeData = {
            resumeUrl: source,  
            extracted_email: documentSummary.content.extracted_email,
            extracted_phone_number: documentSummary.content.extracted_phone_number, 
            jobDetailsId: jd._id,
            extracted_name: documentSummary.content.extracted_name,
            address: '1233',
            summaries: documentSummary.summary,
            job_role: jd.jobRole,
          
          };  
        } else if(documentSummary) {
          resumeData = {
            resumeUrl: documentSummary.Resume,  
            extracted_email: documentSummary.extracted_email,
            extracted_phone_number: documentSummary.extracted_phone_number, 
            jobDetailsId: jd._id,
            extracted_name: documentSummary.extracted_name,
            address: '1233',
            summaries: documentSummary.Summary,
            job_role: jd.jobRole,
          };  
        }
        console.log("resumeData...", resumeData)
        const response2 = await fetch(craeteCandidateApiUrl, {            
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(resumeData),
        });
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


  const openTab = (tabName, jd = null) => {
    setActiveTab(tabName);
  
if (tabName === "view-job-description") {
      setIsViewJdDetailsOpen(true);
      setSelectedJD(selectedJD);
      setSelectedJD({ ...jd, userRole: 'recruiter', });
    }
    else {
    }
  };
  const handleViewJD = (selectedJD) => {
    openTab("view-job-description", selectedJD);
  };


// Function to copy text to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Link copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
};


  return (
    <Container>
      <CssBaseline />
      <AppBar position="absolute" style={{ backgroundColor: 'rgba(232, 222, 248, 1)', borderBottom: '1.5px solid black' }}>
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MenuIcon sx={{ marginRight: '10px', color: 'black' }} />
            <Typography variant="h6" component="div" style={{ color: 'black', fontWeight: 'bold', fontFamily: 'Righteous', fontSize: '30px' }}>
              Resourcing Bot
            </Typography>
          </Box>
          <Paper style={{ height: '20px', padding: '25px', maxWidth: '300px', backgroundColor: 'transparent', border: '1px solid rgba(79, 55, 139, 1)', borderRadius: '20px' }}>
          {userData && (
            <Box display="flex" style={{ marginTop: '-20px' }}>
              <StyledAvatar>{userData.name.charAt(0)}</StyledAvatar>
              <Box>
                <Typography variant="body1" style={{ color: 'black', fontWeight: 'bold' }}>
                  {userData.name}
                </Typography>
                <Typography variant="body2" style={{ color: 'black' }}>
                 {userData.userType}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
        </Toolbar>
      </AppBar>

      <MenuContainer >
        <Typography variant="body1" sx={{ marginLeft: '0px', marginTop: '100px' }}>Recruitment Tools</Typography><br></br>
        <CustomIconButton color="inherit" onClick={() => { setActiveTab("RecruiterDashboard"); sessionStorage.setItem('activeTab', 'RecruiterDashboard'); window.location.reload(); }}>
        <WidgetsIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Recruitment Dashboard</Typography>
        </CustomIconButton><br></br>
        <CustomIconButton color="inherit" onClick={() => { setActiveTab('Scheduled'); fetchScheduledInterviews(email); }}>
          <AccessTimeIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Scheduled Interviews</Typography>
        </CustomIconButton>
        <br></br>
        <Divider style={{ width: '100%', marginTop: '30px', borderBottomWidth: 1, backgroundColor: '#370665', height: '0.5px' }} /><br></br>
        <Typography variant="body1" sx={{ marginLeft: '0px' }}>Reporting</Typography><br></br>
        <CustomIconButton color="inherit" onClick={() => { setActiveTab('report'); sessionStorage.setItem('activeTab', 'report'); window.location.reload(); }} selected={activeTab === 'report'}>
          <BarChartIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Report</Typography>
        </CustomIconButton>
        <Divider style={{ width: '100%', marginTop: '30px', borderBottomWidth: 1, backgroundColor: '#370665', height: '0.5px' }} /><br></br>
        <Typography variant="body1" sx={{ marginLeft: '0px', }}>Account</Typography><br></br>
        <CustomIconButton color="inherit" onClick={handleProfileTabClick} selected={activeTab === 'profile'}>
          <PersonIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Profile</Typography>
        </CustomIconButton><br></br>
        <CustomIconButton color="inherit" onClick={handleLogout}>
          <ExitToAppIcon /><br></br>
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Logout</Typography>
        </CustomIconButton>
      </MenuContainer>

      <CenteredSection>
      <ScrollableContent>

        {activeTab === 'profile' && (
            <ProfileForm userData={userData} />

        )}
        {activeTab === 'RecruiterDashboard' && (
          <StyledPaper>
            <Typography variant="h4" component="div" style={{marginTop:'10px', marginBottom: '20px', fontFamily: 'Righteous', fontWeight: 'bold', fontSize: '50px', color: 'black' }}>
              Recruitment Dashboard
            </Typography>
            {jds.length === 0 ? (
              <Typography variant="body1" style={{ textAlign: 'center', color: 'black', fontSize: '20px', marginBottom: '50px' }}>
                Loading...
              </Typography>
            ) : (
              <ScrollableTableContainer component={Paper}>
                <StyledTable aria-label="simple table">
                   <TableHead>
                    <TableRow>
                    {[ "RecruiterDashboard"].includes(activeTab) && (
                    <TableCell style={{ fontWeight: 'bold' , border: '1px solid lightgray',textAlign:'center'}}>JD ID</TableCell>
                     )}
                        <TableCell style={{ fontWeight: 'bold', border: '1px solid lightgray',textAlign:'center' }}>Job Role</TableCell>
                        <TableCell style={{ fontWeight: 'bold', border: '1px solid lightgray',textAlign:'center' }}>Search Candidates</TableCell>
                        <TableCell style={{ fontWeight: 'bold', border: '1px solid lightgray',textAlign:'center' }}>Candidates</TableCell> 
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedJds.map((jd) => (
                      <TableRow key={jd._id}>
                            <TableCell component="th" scope="row" sx={{ border: '1px solid lightgray', textAlign: 'center' }}>
                              <Button
                                onClick={() => handleViewJD(jd)} sx={{textDecoration: 'underline', ':hover': {textDecoration: 'underline'}}}>
                                {jd.jdID} </Button>
                           </TableCell>
                                <TableCell component="th" scope="row" sx={{ border: '1px solid lightgray',textAlign:'center'}}>
                                    {jd.jobRole}
                                </TableCell>
                                <TableCell component="th" scope="row" sx={{ border: '0.1px solid lightgray', textAlign: 'center' }}>
                                  {loadingSearchCandidatesMap[jd._id] ? (
                                    <Button variant="contained" color="primary" style={{ marginTop: '10px' }} disabled>
                                      <CircularProgress size={24} color="inherit" />
                                    </Button>
                                  ) : (
                                    <Button color="primary" style={{ marginTop: '10px' }} onClick={() => handleSearchCandidates(jd)}>
                                      Search
                                    </Button>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button color="primary" style={{ marginTop: "10px" }} 
                                  onClick={() => handleViewCandidateProfiles(jd._id,'recruiter')}>
                                     View Candidates </Button>
                                </TableCell>
                      </TableRow>
                    ))}
                  </TableBody> 
                </StyledTable>
              </ScrollableTableContainer>
            )}
               <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} totalPages={totalPages} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} />
          </StyledPaper>
        )}

          {activeTab === 'report' && (
            <div style={{ marginTop: '400px',marginLeft:'500px' }}>
              {/* Display Reports */}
              <Typography variant="h5" style={{ marginTop: '200px', marginBottom: '10px', color: "black", fontFamily: 'Righteous', fontSize: '50px', fontWeight: 'bold' }}>Reports</Typography>
                <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)' }}>
                Under Implementation
                </Typography>
            </div>
          )}

        {showCandidateProfiles && selectedCandidateProfileId && (
          <CandidateProfiles
            jdId={selectedCandidateProfileId}
            userType={selectedUserType}
          />
        )}
{isViewJdDetailsOpen && <JDDetails jdDetails={selectedJD} userRole="recruiter"  />}
{activeTab === 'resumeDisplay' && resumeData && (
          <ResumeDisplay resumeData={resumeData} />
        )}


{activeTab === 'Scheduled' && (
            <div style={{ marginTop: '150px',marginLeft:'60px'}}>
              
                  <Typography variant="h4" component="div" style={{marginTop:'10px', marginBottom: '20px', fontFamily: 'Righteous', fontWeight: 'bold', fontSize: '50px', color: 'black' }}>
                    Scheduled Interviews
                  </Typography>
                  <div style={{width:'60%',position:'absolute'}}>
                  <ScrollableTableContainer component={Paper}>
                <StyledTable aria-label="simple table">
      <Table style={{justifyContent:'center',alignContent:'center'}}>
        <TableHead>
          <TableRow style={{backgroundColor:"rgba(79, 55, 139, 1)"}}>
          <TableCell className="candidateProfiletable-cell-head" >Interview ID</TableCell>
          <TableCell className="candidateProfiletable-cell-head">Candidatename</TableCell>
          <TableCell className="candidateProfiletable-cell-head">JD ID</TableCell>
            <TableCell className="candidateProfiletable-cell-head">Candidate ID</TableCell>
            <TableCell className="candidateProfiletable-cell-head">Scheduled Time&Date</TableCell>
            <TableCell className="candidateProfiletable-cell-head">Interview Link</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (                            
            <TableRow key={row.candidateID}>
               <TableCell className="candidateProfiletable-cell-head">  {row.interviewDetails ? row.interviewDetails.interview_id : 'N/A'}</TableCell>
                <TableCell className="candidateProfiletable-cell-head">{row.candidatename}</TableCell>
                  <TableCell className="candidateProfiletable-cell-head">
                    <Button onClick={() => handleViewJD(row.jddetails_id)} sx={{ textDecoration: 'underline', ':hover': { textDecoration: 'underline' } }} >
                        {row.jddetails_id.jdID}
                    </Button>
                  </TableCell>
                <TableCell className="candidateProfiletable-cell-head">{row.candidateID}</TableCell>
                <TableCell className="candidateProfiletable-cell-head">
                   {row.interviewDetails ? row.interviewDetails.interview_time : 'N/A'}
                </TableCell>
                <TableCell className="candidateProfiletable-cell-head">
                {row.interviewDetails ? (
                  <>
                    <Button
                      onClick={() => copyToClipboard(row.interviewDetails.google_meet_link)}
                      sx={{textDecoration: 'underline', ':hover': {textDecoration: 'underline'}}}
                      aria-label="copy link"
                    >
                  copy link
                    </Button>
                  </>
                ) : 'N/A'}
            </TableCell>
            </TableRow>
              )
        )}
        </TableBody>
      </Table>
      </StyledTable>
      </ScrollableTableContainer>
              <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} totalPages={totalPages} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} />
          </div>
            </div>
          )}
        </ScrollableContent>
      </CenteredSection>
    </Container>
  );
}

export default RecruiterDashboard;


