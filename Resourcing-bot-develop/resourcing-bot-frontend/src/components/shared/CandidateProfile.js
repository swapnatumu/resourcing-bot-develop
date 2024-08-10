


import React, { useEffect, useState } from 'react';
import { useNavigate, } from 'react-router-dom';
import axios from 'axios';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar,Button,Toolbar,Box ,IconButton} from '@mui/material';
import styled from 'styled-components';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../styles/HiringdashBoard.css';
import CandidateData from './CandidateData.js';
import Pagination from  '../../utils/Pagination.js';

const StyledPaper = styled(Paper)`
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
`;

const StyledTable = styled(Table)`
  min-width: 650px;

  & thead th {
    background-color:rgba(79, 55, 139, 1);
    color: #ffffff;
    font-weight: bold;
  }

  & tbody tr:hover {
    background-color: #f5f5f5;
  }

  & th,
  & td {
    padding: 16px;
  }
`;

  const CandidateProfiles = ({ jdId,userType ,candidateId}) => {
  const [profiles, setProfiles] = useState([]);
  console.log("profiles:",profiles)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();
  const [recruiterScreenAcceptCount, setRecruiterScreenAcceptCount] = useState(0); 
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [showCandidateData, setShowCandidateData] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [overallStatus, setOverallStatus] = useState('');

const baseUrl = process.env.REACT_APP_CANDIDATE_PROFILE_BY_JDID_API;

const candidateProfileByJDApi = `${baseUrl}/${jdId}`;
const getpdfApiUrl = process.env.REACT_APP_GET_PDF_API;
const getrecruiterInterviewerApiUrl = process.env.REACT_APP_GET_RECRUITERS_INTERVIEWERS_API;

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 4;

const totalPages = Math.ceil(profiles.length / itemsPerPage);
const handlePrevPage = () => {
  setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
};

const handleNextPage = () => {
  setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
};

  // Calculate start and end index for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfiles = profiles.slice(startIndex, endIndex);




const fetchProfiles = async () => {
  try {
    if (!jdId) {
      console.error('JD ID is undefined');
      return;
    }
    
   
    const response = await axios.get(candidateProfileByJDApi);

    
    console.log("response123:", response);
    
    const profilesWithRecruiters = response.data.map(async (profile) => {
     
      const recruiterResponse = await axios.get(getrecruiterInterviewerApiUrl);

      return { ...profile, recruiterEmails: recruiterResponse.data };
    });
    const resolvedProfiles = await Promise.all(profilesWithRecruiters);
    setProfiles(resolvedProfiles);
  } 
  catch (error) {

    console.log('Error object:', error);

    if (error.response && error.response.status === 404) {
      console.log('No candidate profiles found for this JD ID.');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage('Failed to fetch candidate profiles');
      setSnackbarOpen(true);
    }
  }
};



useEffect(() => {
  if (jdId && userType) {
    fetchProfiles();
  } else {
    console.log('JD ID is undefined');
  }
}, [jdId, userType]);


  // Count RecruiterScreenAccept profiles
  useEffect(() => {
    const countRecruiterScreenAccept = () => {
      const count = profiles.filter(profile => profile.overallStatus === 'RecruiterScreenAccept').length;
      setRecruiterScreenAcceptCount(count);
    };

    countRecruiterScreenAccept();
  }, [profiles]);


  const handleResumedisplay = async (resumePaths) => {
    try {
      const pathsArray = Array.isArray(resumePaths) ? resumePaths.map(obj => obj.path) : [resumePaths];

      for (const resumePath of pathsArray) {

        const response = await axios.get(`${getpdfApiUrl}=${resumePath}`, {
          responseType: 'arraybuffer',
        });

        if (response.status === 200) {
          const resumeBlob = new Blob([response.data], { type: 'application/pdf' });
          const resumeUrl = URL.createObjectURL(resumeBlob);
          window.open(resumeUrl, '_blank');
        } else {
          window.alert('Failed to fetch resume from the backend API.');
        }
      }
    } catch (error) {
      console.error('Error fetching resumes from backend:', error);
      window.alert('Failed to fetch resumes from the backend API.');
    }
  };

  const handleBack = () => {
    navigate(-0);
  };

  const handlebuttonclick = (candidateId,candidateEmail,overallStatus) => {
    if (!candidateId) {
      console.error('Candidate ID is undefined');
      return;
    }
    setSelectedCandidateId(candidateId);
    setIsModalOpen(true);
    setCandidateEmail(candidateEmail);
    setOverallStatus(overallStatus);
    setShowCandidateData(true);
  };
  
  const handleClose = () => {
    setSelectedCandidateId(null);
    setShowCandidateData(false); 
  };


  const filteredProfiles = profiles.filter(profile => 
    userType === 'interviewer' ? profile.overallStatus === 'InterviewScheduled' : true
  );
    // Filtering selectedProfiles based on filteredProfiles
    const displayedProfiles = currentProfiles.filter(profile => filteredProfiles.includes(profile));
  

return (
  <div>
    {/* Conditionally render Toolbar and Box */}
    {(!showCandidateData ) && (
      <>
        <Toolbar style={{ position: 'relative', marginTop: '100px' }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleBack} style={{ marginRight: '20px', color: 'black' }}>
              <ArrowBackIcon style={{ fontSize: '50px' }} />
            </IconButton>
            <Typography variant="h1" style={{ color: 'black', fontFamily: 'Righteous', fontSize: '50px' }}>
              Candidate Profiles
            </Typography>
          </Box>
        </Toolbar>

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '60px',
            marginTop: '40px',
            border: '1px solid rgba(79, 55, 139, 1)',
            width: '30%',
            borderRadius: '20px',
            backgroundColor: 'rgba(232, 222, 248, 1)',
            padding: '10px',
          }}
        >
          {recruiterScreenAcceptCount !== 0 && (
            <Typography
              variant="h3"
              component="div"
              sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}
            >
              {recruiterScreenAcceptCount}
            </Typography>
          )}
          <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)' }}>
            New Candidates Waiting for Review
          </Typography>
        </Box>
      </>
    )}

    {/* Conditionally render candidate profile table */}
    {(!showCandidateData  ) && (
      <div>
        {profiles.length > 0 ? (
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)' }}>
                Job Role: {profiles[0].jobRole}
              </Typography>
            </Box>
            <TableContainer component={Paper}>
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell className="candidateProfiletable-cell-head">Candidate ID</TableCell>
                    <TableCell className="candidateProfiletable-cell-head">Candidate Name</TableCell>
                    <TableCell className="candidateProfiletable-cell-head">Candidate Email</TableCell>
                    <TableCell className="candidateProfiletable-cell-head">Resume URL</TableCell>
                    <TableCell className="candidateProfiletable-cell-head">Overall Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {displayedProfiles.map((profile) => ( */}
                  {displayedProfiles
                  .filter(profile => !(userType === 'hiringManager' && profile.overallStatus === 'NewCandidate'))
                  .map((profile) => (
                    <TableRow key={profile._id}>
                      <TableCell className="candidateProfiletable-cell">
                        <Button
                          onClick={() => handlebuttonclick(profile._id,profile.candidateEmail,profile.overallStatus)}
                          sx={{ textDecoration: 'underline', ':hover': { textDecoration: 'underline' } }}
                        >
                          {profile.candidateID}
                        </Button>
                      </TableCell>
                      <TableCell className="candidateProfiletable-cell">{profile.candidatename}</TableCell>
                      <TableCell className="candidateProfiletable-cell">{profile.candidateEmail}</TableCell>
                      <TableCell className="candidateProfiletable-cell">
                        <Button>
                          <a href="#" onClick={() => handleResumedisplay(profile.resumeUrl)}>
                            {profile.resumeUrl}
                          </a>
                        </Button>
                      </TableCell>
                      <TableCell className="candidateProfiletable-cell">
                        <Button sx={{ backgroundColor: '#d4edda', color: 'black', borderRadius: '20px' }}>
                          {profile.overallStatus}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </StyledTable>
              <Pagination
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                handlePrevPage={handlePrevPage}
                handleNextPage={handleNextPage}
              />
            </TableContainer>
          </StyledPaper>
        ) : (
          <Typography gutterBottom style={{ textAlign: 'center', marginTop: '200px', fontFamily: 'Righteous', fontSize: '50px', fontWeight: 'bold' }}>
            No Candidate Profiles to display.
          </Typography>
        )}
      </div>
    )}


{showCandidateData && (
      <CandidateData candidateId={selectedCandidateId} 
      userRole={userType} 
      candidateEmail={candidateEmail} 
      overallStatus={overallStatus}
      jdId={jdId}
      onClose={handleClose} />
    )}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={() => setSnackbarOpen(false)}
      message={snackbarMessage}
    />
  </div>
);

};

export default CandidateProfiles;