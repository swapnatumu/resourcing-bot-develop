


import React, { useState, useEffect } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import axios from "axios";
import {  Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Box, Avatar, AppBar, Toolbar, IconButton, CssBaseline } from '@mui/material';
import styled from 'styled-components';

import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import WidgetsIcon from "@mui/icons-material/Widgets";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Divider from '@mui/material/Divider';
import ProfileForm from '../shared/Profileform.js';
import CandidateProfiles from '../shared/CandidateProfile.js';
import Pagination from  '../../utils/Pagination.js';
import JDDetails from "../shared/JDDetails.js";
const Container = styled.div`
  display: flex;
  overflow:hidden; 
`;

function InterviewerDashboard() {
  
    const location = useLocation();
    const { email, name, phone ,userType} =  useLocation().state || {};
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [interviewerDocuments, setInterviewerDocuments] = useState([]);
    const [activeTab, setActiveTab] = useState("InterviewerDashboard");
    const [showCandidateProfiles, setShowCandidateProfiles] = useState(false);
    const [selectedCandidateProfileId, setSelectedCandidateProfileId] = useState(null);
    const [selectedUserType, setSelectedUserType] = useState(null);

    const logoutApiUrl = process.env.REACT_APP_LOGOUT_API;
   
    const baseUrl = process.env.REACT_APP_GET_SCHEDULED_INTERVIEWS_API;
    const [selectedJD, setSelectedJD] = useState(null);
    const [isViewJdDetailsOpen, setIsViewJdDetailsOpen] = useState(false);
  

  useEffect(() => {
      if (name && phone && email && userType) {
        // Only set userData if all values are present
        setUserData({ name, phone, email,userType });
      }
    }, [name, phone, email,userType]);
  
 // for tab switching
useEffect(() => {
  const savedActiveTab = sessionStorage.getItem('activeTab');
  if (savedActiveTab) {
    setActiveTab(savedActiveTab);
    sessionStorage.removeItem('activeTab'); 
  }
}, []);
 
  useEffect(() => {
		setInterviewerDocuments(jds);
	}, [location.search]);
	const { jds } = location.state || {};

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
 
   
 
const CenteredSection = styled.div`
text-align: center;
margin-bottom: 50px;
overflow-y: hidden;
`;

const ScrollableContent = styled.div`
width: 80%;
height: 100%;
overflow-y: auto;
scroll-behavior: hidden-scroll;
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
width: 60%;
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
const handleInterviewerDashboardClick = () => {
  sessionStorage.setItem('activeTab', 'InterviewerDashboard');
  window.location.reload();
};

const handleScheduledInterviewsClick = () => {
  sessionStorage.setItem('activeTab', 'scheduledinterviews');
  window.location.reload();
};

const handleViewCandidateProfiles = (jdId) => {
    console.log('JD ID:', jdId); 
    if (jdId) { 
      setShowCandidateProfiles(true);
      setSelectedCandidateProfileId(jdId);
      setSelectedUserType(userType);
     
      setActiveTab('');
    }
  };

const openTab = (tabName, jd = null) => {
  setActiveTab(tabName);

if (tabName === "view-job-description") {
    setIsViewJdDetailsOpen(true);
    setSelectedJD(selectedJD);
    setSelectedJD({ ...jd, userRole: 'recruiter' });
  }
  else {
  }
};
const handleViewJD = (selectedJD) => {
  openTab("view-job-description", selectedJD);
};



const [interviews, setInterviews] = useState([]);
const InterviewsByInterviewerEmail = process.env.REACT_APP__GET_INTERVIEWER_BY_INTERVIEWER_EMAIL_API;
const getinterviewerbyintervieweremail = `${InterviewsByInterviewerEmail}/${email}`;

    useEffect(() => {
      const fetchScheduledInterviews = async () => {
   

          try {
              const email = location.state.email;
              console.log("email:", email);
              const url = getinterviewerbyintervieweremail;
              console.log(url);
  
              const response = await fetch(url);
              console.log("response ine intervirdashbord line 230:", response)
              if (!response.ok) {
                  throw new Error('Failed to fetch scheduled interviews');
              }
              const data = await response.json();
              setInterviews(data);
              console.log("Interviews Data:", data);

          } catch (error) {
              console.error('Error fetching scheduled interviews:', error.message);
          }
      };

  if (activeTab === 'scheduledinterviews') {
        fetchScheduledInterviews();
    }
}, [activeTab, location.state.email]);

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(); 
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
      <MenuContainer>
        <Typography variant="body1" sx={{ marginLeft: '0px', marginTop: '100px' }}>Interviewer Tools</Typography><br></br>
        <CustomIconButton color="inherit" onClick={handleInterviewerDashboardClick}>
          <WidgetsIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Interviewer Dashboard</Typography>
        </CustomIconButton><br></br>
        <CustomIconButton color="inherit" onClick={handleScheduledInterviewsClick} selected={activeTab === 'scheduledinterviews'}>
          <AccessTimeIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Scheduled Interviews</Typography>
      </CustomIconButton>
        <Divider style={{ width: '100%', marginTop: '30px', borderBottomWidth: 1, backgroundColor: '#370665', height: '0.5px' }} /><br></br>
        <Typography variant="body1" sx={{ marginLeft: '0px' }}>Reporting</Typography><br></br>
        <CustomIconButton color="inherit" onClick={() => setActiveTab('report')} selected={activeTab === 'report'}>
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

      {activeTab === 'InterviewerDashboard' && (
          <StyledPaper>
            <Typography variant="h4" component="div" style={{marginTop:'10px', marginBottom: '20px', fontFamily: 'Righteous', fontWeight: 'bold', fontSize: '50px', color: 'black' }}>
              Interviewer Dashboard
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
                    {["ScreeningTest", "InterviewerDashboard"].includes(activeTab) && (
                    <TableCell style={{ fontWeight: 'bold' , border: '1px solid lightgray',textAlign:'center'}}>JD ID</TableCell>
                     )}
                        <TableCell style={{ fontWeight: 'bold', border: '1px solid lightgray',textAlign:'center' }}>Job Role</TableCell>
                        <TableCell style={{ fontWeight: 'bold', border: '1px solid lightgray',textAlign:'center' }}>Candidates</TableCell> 
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedJds.map((jd) => (
                      <TableRow key={jd._id}>
                            <TableCell component="th" scope="row" sx={{ border: '1px solid lightgray', textAlign: 'center' }}><Button
                                onClick={() => handleViewJD(jd)} sx={{textDecoration: 'underline', ':hover': {textDecoration: 'underline'}}}>
                                {jd.jdID} </Button>
                           </TableCell>
                                <TableCell component="th" scope="row" sx={{ border: '1px solid lightgray',textAlign:'center'}}>
                                    {jd.jobRole}
                                </TableCell>
                                <TableCell>
                                  <Button color="primary" style={{ marginTop: "10px" }} 
                                  onClick={() => handleViewCandidateProfiles(jd._id,'interviewer')}>
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

 {activeTab === 'scheduledinterviews' && (
  
                <TableContainer component={Paper} style={{ marginTop: "200px" ,alignItems:'center',width:'80%',marginLeft:'200px'}}>
            <Typography variant="h4" component="div" style={{marginTop:'10px', marginBottom: '20px', fontFamily: 'Righteous', fontWeight: 'bold', fontSize: '50px', color: 'black' }}>
                        Scheduled Interviews
                    </Typography>
                    <Table style={{width:'90%',justifyContent:'center',alignContent:'center'}}>
                        <TableHead>
                            <TableRow style={{ backgroundColor: "#4f378b" }}>
                                <TableCell style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>JD Details</TableCell>
                                <TableCell style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Candidate Email</TableCell>
                                <TableCell style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Google Meet Link</TableCell>
                                <TableCell style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Interview Time</TableCell>
                                <TableCell style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Interview Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                             {interviews.map((interview) => (
                                <TableRow key={interview._id}>                                 
                                    <TableCell className="candidateProfiletable-cell-head">
                                      <Button onClick={() => handleViewJD(interview.jddetails_id)} sx={{ textDecoration: 'underline', ':hover': { textDecoration: 'underline' } }} >
                                          {interview.jddetails_id.jdID}
                                      </Button>
                                    </TableCell>

                                    <TableCell style={{ border: '1px solid lightgray', textAlign: 'center' }}>{interview.candidate_email}</TableCell>
                                    <TableCell style={{ border: '1px solid lightgray', textAlign: 'center' }}>
                                        <a href={interview.google_meet_link} target="_blank" rel="noopener noreferrer">
                                            {interview.google_meet_link}
                                        </a>
                                    </TableCell>
                                    <TableCell style={{ border: '1px solid lightgray', textAlign: 'center' }}>{formatTime(interview.interview_time)}</TableCell>
                                    <TableCell style={{ border: '1px solid lightgray', textAlign: 'center' }}>{formatDate(interview.interview_time)}</TableCell>
                                </TableRow>
                             )
                          )} 
                        </TableBody>
                    </Table>
                    <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} totalPages={totalPages} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} />
                </TableContainer>   
            )}

        {activeTab === 'profile' && (
          <ProfileForm userData={userData}/>
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
        {isViewJdDetailsOpen && <JDDetails jdDetails={selectedJD} userRole="interviewer"  />}
        </ScrollableContent>
      </CenteredSection>
    </Container>
  );
}

export default InterviewerDashboard;


