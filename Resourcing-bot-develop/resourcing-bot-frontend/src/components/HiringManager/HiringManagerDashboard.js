


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button,Typography, Table,Box, TableBody,Avatar, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Drawer, List, ListItem, ListItemText, Toolbar, AppBar, CssBaseline, IconButton } from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';

import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WidgetsIcon from "@mui/icons-material/Widgets";
import BarChartIcon from "@mui/icons-material/BarChart";
import Divider from '@mui/material/Divider';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import JobDescriptionForm from './JobDescriptionForm.js';
import JDDetails from '../shared/JDDetails.js';
import CandidateProfiles from '../shared/CandidateProfile.js';
import ArchivedJdsPage from './ArchivedJdsPage.js';
import '../../styles/HiringdashBoard.css';
import ProfileForm from '../shared/Profileform.js';
import Pagination from  '../../utils/Pagination.js';

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'lightgray',
    width: '100%',
    height: '5%',
    borderRadius: '15px',
  },
}));

const Container = styled.div`
  padding: 20px;
  background-color: transparent;
  height: 90vh;
  width: 70vw;
  box-sizing: border-box;
  text-align: center;
  position: fixed; 
  top: 50%;
  left: 60%;
  transform: translate(-50%, -50%); 
  overflow: auto;
  scrollbar-width: none; 
  -ms-overflow-style: none; 
  &::-webkit-scrollbar {
    display: none; 
  }
`;

const CenteredSection = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const StyledPaper = styled(Paper)`
  padding: 20px;
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
  height: calc(100vh - 250px);
  overflow-y: auto;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
  justify-content: flex-end;
 
`;
const ContainerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 80px;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20%;
  background-color:rgba(232, 222, 248, 1) ;
  height: 100vh;
  align-items: flex-start;
  padding:50px;
`;
const StyledAvatar = styled(Avatar)`
  background-color: rgba(79, 55, 139, 1);
  margin-right: 10px;
`;



function HiringManagerDashboard() {
  const navigate = useNavigate();
  const { email, name, phone ,userType} = useLocation().state || {};
 
  const [jds, setJds] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentJDId, setCurrentJDId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null); 
  const [userData, setUserData] = useState(null);
  const [isCreateJDOpen, setIsCreateJDOpen] = useState(false);
  const [isEditJDOpen, setIsEditJDOpen] = useState(false);
  const [hiringManagerEmail, setHiringManagerEmail] = useState('');
  const [selectedJD, setSelectedJD] = useState(null);
  const [isViewJdDetailsOpen, setIsViewJdDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("hiringDashboard");
  const [fromEditJobDescription, setFromEditJobDescription] = useState(false);
  const [showCandidateProfiles, setShowCandidateProfiles] = useState(false);
  const [selectedCandidateProfileId, setSelectedCandidateProfileId] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const logoutApiUrl = process.env.REACT_APP_LOGOUT_API;

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


  const fetchJds = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_FETCH_JDS_API}=${email}`);
      console.log("response: ", response)

      setJds(response.data.activeJds);
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
    }
  };
// for tabs switching
  useEffect(() => {
    const savedActiveTab = sessionStorage.getItem('activeTab');
    if (savedActiveTab) {
      setActiveTab(savedActiveTab);
      sessionStorage.removeItem('activeTab');
    }
  }, []);
  
// to get the user data
  useEffect(() => {
    if (name && phone && email && userType) {
      // Only set userData if all values are present
      setUserData({ name, phone, email,userType });
    }
  }, [name, phone, email,userType]);


  useEffect(() => {
    fetchJds();
  }, [email]);


  useEffect(() => {
    console.log('JDs:', jds); 
  }, [jds]);
  

const handleMenuClose = () => {
    setAnchorEl(null);
  };


  const openTab = (tabName, jd = null) => {
    setActiveTab(tabName);
  
    if (tabName === "job-description-form") {
      setIsCreateJDOpen(true);
      setSelectedJD(jd); 
      setIsViewJdDetailsOpen(false); 

      if (jd !== null) {
        setFromEditJobDescription(true);
      } else {
        setFromEditJobDescription(false);
      }
    } 
    else if (tabName === "view-job-description") {
      setIsViewJdDetailsOpen(true);
      setSelectedJD(selectedJD);
      setIsCreateJDOpen(false);
      setSelectedJD({ ...jd, userRole: 'hiringManager', hiringManagerEmail: email });
    }
    else {
      setIsCreateJDOpen(false); 
      setIsViewJdDetailsOpen(false); 
    }

    handleMenuClose(); 
  };

  
 
const handleDelete = async (jdId) => {
    try {
      await axios.put(`${process.env.REACT_APP_DELETE_JD_API}/${jdId}`);
      fetchJds();
      setSnackbarMessage('Job description deleted successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to delete job description:', error);
    }
    setOpenDeleteDialog(false);
  };

const handleViewJD = (selectedJD) => {
  openTab("view-job-description", selectedJD);
};


const handleEditClick = (selectedJD) => {
    setIsEditJDOpen(true); 
    setSelectedJD(selectedJD);
    setActiveTab('')
    setHiringManagerEmail(email); 
  };

  const handleCreateJD = () => {
    setIsCreateJDOpen(true); 
    setSelectedJD(null);
    setActiveTab('')
    setHiringManagerEmail(email); 
        
  };

  const handleOpenDeleteDialog = (jd) => {
    setCurrentJDId(jd);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleArchiveButtonClick = () => {
    setShowCandidateProfiles(false); 
    sessionStorage.setItem('activeTab', 'archivedJds');
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

  const tabHeadings = {
    hiringDashboard: 'Hiring Dashboard',
    rejectedUsers: 'Rejected Users',
    createReport: 'Create Report',
    profile: '',
    logout: 'Logout',
  };
  const getTabHeading = (heading) => (
    <Typography
      variant="h5"
      style={{
        marginTop: '20px',
        color: "black",
        fontFamily: 'Righteous',
        fontSize: '50px',
        fontWeight: 'bold',
        marginLeft: '-100px',
      }}
    >
      {heading}
    </Typography>
  );

  const handleProfileTabClick = () => {
    sessionStorage.setItem('activeTab', 'profile');
    window.location.reload();
  };

  const buttonClickFunction = (isCreateJDOpen, isViewJdDetailsOpen, activeTab,showCandidateProfiles) => {
    return (
    activeTab === "hiringDashboard") && !isCreateJDOpen && !isViewJdDetailsOpen   && !showCandidateProfiles;
  };



  const handleViewCandidateProfiles = (jdId) => {
    if (jdId) { 
      setShowCandidateProfiles(true);
      setSelectedCandidateProfileId(jdId);
      setSelectedUserType(userType);
      setActiveTab('');
    }
  };


return (
  <div style={{ display: 'flex' }}>
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
      <Typography variant="body1" sx={{ marginLeft: '0px', marginTop: '100px' }}>Hiring Tools</Typography><br />
      <CustomIconButton color="inherit" onClick={() => { sessionStorage.setItem('activeTab', 'hiringDashboard'); setActiveTab("hiringDashboard"); window.location.reload(); }}>
        <WidgetsIcon />
        <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Hiring Dashboard</Typography>
      </CustomIconButton>
      <br />
      <CustomIconButton color="inherit" onClick={handleArchiveButtonClick}>
        <ArchiveOutlinedIcon />
        <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold', borderRadius: '20px' }}>Archived JDS</Typography>
      </CustomIconButton>
      <Divider style={{ width: '100%', marginTop: '30px', borderBottomWidth: 1, backgroundColor: '#370665', height: '0.5px' }} /><br />
      <Typography variant="body1" sx={{ marginLeft: '0px' }}>Reporting</Typography><br />
       <CustomIconButton color="inherit" onClick={() => setActiveTab('report')} selected={activeTab === 'report'}>
          <BarChartIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Report</Typography>
        </CustomIconButton>
      <Divider style={{ width: '100%', marginTop: '30px', borderBottomWidth: 1, backgroundColor: '#370665', height: '0.5px' }} /><br />
      <Typography variant="body1" sx={{ marginLeft: '0px' }}>Account</Typography><br />
      <CustomIconButton color="inherit" onClick={handleProfileTabClick} selected={activeTab === 'profile'}>
          <PersonIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Profile</Typography>
        </CustomIconButton><br></br>
      <CustomIconButton color="inherit" onClick={handleLogout} >  
        <ExitToAppIcon /><br />
        <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Logout</Typography>
      </CustomIconButton>
    </MenuContainer>
    <ContainerWrapper>
      <Container>
        <CenteredSection>
          {getTabHeading(tabHeadings[activeTab])}
        </CenteredSection>
          {buttonClickFunction(isCreateJDOpen, isViewJdDetailsOpen, activeTab) && (
          <>
            <CenteredSection>
            <Box sx={{ padding: '15px',display: 'flex', alignItems: 'center', marginTop: '40px',backgroundColor:'rgba(232, 222, 248, 1)',width:'20%',borderRadius:'20px'}}>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
                {jds.length}
              </Typography>
              <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)' }}>
                Active Jobs
              </Typography>
            </Box>
              {activeTab === "hiringDashboard" && (
                <>
                  <Button variant="contained" onClick={handleCreateJD}
                    sx={{ backgroundColor: 'rgba(79, 55, 139, 1)', fontWeight: 'bold', marginRight: '10px', borderRadius: '20px' }} >
                    Create New Job
                  </Button>
                </>
              )}
            </CenteredSection>
            {jds.length === 0 ? (
              <StyledPaper>
                <Typography variant="body1" align="center">
                  No job descriptions found.
                </Typography>
              </StyledPaper>
            ) : (
              <StyledPaper>
                <ScrollableTableContainer component={Paper} sx={{ overflow: 'auto', width: '100%', height: '400px', backgroundColor: 'transparent',position:'relative' }}>
                  <StyledTable aria-label="job descriptions table">
                    <TableHead sx={{ width: '100%', margin: 'auto', border: '1px solid lightgray', borderCollapse: 'collapse' }}>
                      <TableRow sx={{ backgroundColor: 'rgba(79, 55, 139, 1)', border: '1px solid lightgray' }}>
                         <TableCell className="table-header-cell">JD ID</TableCell>
                        <TableCell className="table-header-cell">Job Role</TableCell>
                        <TableCell className="table-header-cell">Candidates</TableCell> 
                          <TableCell className="table-header-cell">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedJds.map((jd) => (
                        <TableRow key={jd.id}>
                          <TableCell component="th" scope="row" style={{ border: '1px solid lightgray', textAlign: 'center' }}>
                            {jd.jdID}
                          </TableCell>
                          <TableCell style={{ border: '1px solid lightgray', textAlign: 'center' }}>
                            {jd.jobRole}
                          </TableCell>
                          <TableCell align="center">
                            <Button onClick={() => handleViewCandidateProfiles(jd._id, 'hiringManager')}>
                                  View Candidates
                            </Button>

                          </TableCell>
                            <TableCell align="center" style={{ border: '0.1px solid lightgray', textAlign: 'center' }}>
                              <IconButton onClick={() => handleViewJD(jd,hiringManagerEmail)} sx={{ color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton onClick={() => handleEditClick(jd)} sx={{ color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleOpenDeleteDialog(jd._id)} sx={{ color: 'rgba(79, 55, 139, 1)' }}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          {/* )} */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </StyledTable>
                </ScrollableTableContainer>
                <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} totalPages={totalPages} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} />
              </StyledPaper>
            )}
          </>
        )}

{(isCreateJDOpen || isEditJDOpen) && (
        <JobDescriptionForm
          jd={selectedJD}
          isEdit={isEditJDOpen}
          hiringManagerEmail={email} 
          onClose={() => {
            setIsCreateJDOpen(false);
            setIsEditJDOpen(false);
          }}
          onSnackbarOpen={() => {
          }}
          fetchJds={isEditJDOpen ? fetchJds : undefined} 
  
        />
      )}

    {activeTab === 'profile' && (
          <>
            <ProfileForm userData={userData} />
          </>
    )}  
    {activeTab === 'archivedJds' && (
          <>
        <ArchivedJdsPage hiringManagerEmail={email} />
        </>
    )}
  {activeTab === 'report' && (
    <div style={{ marginTop: '40px' }}>
      {/* Display Reports */}
      <Typography variant="h5" style={{ marginTop: '20px', marginBottom: '10px', color: "black", fontFamily: 'Righteous', fontSize: '50px', fontWeight: 'bold' }}>Reports</Typography>
        <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)' }}>
        Under Implementation
        </Typography>

    </div>
  )}


{isViewJdDetailsOpen && <JDDetails jdDetails={selectedJD} userRole="hiringManager" hiringManagerEmail={email} />}


   {showCandidateProfiles && selectedCandidateProfileId && (
        <CandidateProfiles
          jdId={selectedCandidateProfileId}
            userType={selectedUserType}
        />
      )}


      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Job Description"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this job description?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDelete(currentJDId)} color="primary" autoFocus style={{backgroundColor:'red',color:'white'}}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </ContainerWrapper>
  </div>
);
};


export default HiringManagerDashboard;


