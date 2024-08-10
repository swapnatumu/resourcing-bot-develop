


// working code with extracting email while accepting the resume

import React, { useState } from 'react';
import { useLocation,useNavigate} from 'react-router-dom';
import { Typography, Table, TableHead, TableBody, TableRow, TableCell, Button,TextField ,AppBar,Box,Toolbar,IconButton} from '@mui/material';
import axios from 'axios';
import '../../styles/display.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
 
 
function ResumeDisplay() {
  const { state } = useLocation();
  
  const encodedResumePaths = state?.resumePaths;
  const summaries = state?.summaries || [];
  const [errorMessages, setErrorMessages] = useState({});
  const jdId = state?.jdId; 
  const location = useLocation();
  const navigate = useNavigate();
  const [acceptanceStatus, setAcceptanceStatus] = useState({});
  const getpdfApiUrl=process.env.REACT_APP_GET_PDF_API || "http://127.0.0.1:5001/get_pdf?source_path";
  const checkacceptedresumeApiUrl = process.env.REACT_APP_CHECK_ACCEPTED_RESUME_API;
  const rejectresumeApiUrl = process.env.REACT_APP_REJECT_RESUME_API;

  const processResumeApiUrl = process.env.REACT_APP__RECRUITER_RESUMEPROCESS_API;
 
  const resumePaths = Array.isArray(encodedResumePaths)
    ? encodedResumePaths.map((path) => decodeURIComponent(path))
    : [decodeURIComponent(encodedResumePaths)];
 
 
  const resumeNames= resumePaths.map((resumePath) => {
    const lastSlashIndex = resumePath.lastIndexOf('/');
    return resumePath.substring(lastSlashIndex + 1);
  });
 
 
  const [acceptedResumes, setAcceptedResumes] = useState([]);
  

 
  const parseResumeData = (resumeName) => {
    const profileUrl = '';
    const resumeUrl = `${resumeName}`;
    return { profileUrl, resumeUrl };
  };
  const handleViewAcceptedResume = (resumeIndex) => {
    const resumeUrl = resumePaths[resumeIndex];
    handleResumedisplay(resumeUrl);
  };
 

  const handleResumedisplay = async (sourcePaths) => {
  
    try {
      // Ensure sourcePaths is always an array
      const pathsArray = Array.isArray(sourcePaths) ? sourcePaths : [sourcePaths];
      // Iterate over each source path and fetch the resume
        for (const sourcePath of pathsArray) {
        const response = await axios.get(`${getpdfApiUrl}=${sourcePath}`, {
          responseType: 'arraybuffer',
        });

  
        if (response.status === 200) {
       
          // Create a Blob from the response data
          const resumeBlob = new Blob([response.data], { type: 'application/pdf' });
  
          // Create a URL for the Blob
          const resumeUrl = URL.createObjectURL(resumeBlob);
  
          // Open the PDF in a new tab
          window.open(resumeUrl, '_blank');

        } else {
          window.alert('Failed to fetch resume from the backend API.');
        }
      }
    } catch (error) {
      console.error('Error fetching resume from backend:', error);
      window.alert('Failed to fetch resume from the backend API.');
    }
  };
  
 

 		 
const handleBack = () => {
  navigate(-1); // Navigate back
};
  
const handleResume = async (resumeIndex, jdId, action) => {
  const { resumeUrl } = parseResumeData(resumeNames[resumeIndex]);
  const reasonInput = document.getElementById(`reason-for-${resumeIndex}`).value; 
  const wordCount = reasonInput.split(/\s+/).length;
  if (reasonInput.trim() === "") {
      alert("Please enter a reason before accepting or rejecting.");
      return;
  }

  if (wordCount < 2 || wordCount > 50) {
    setErrorMessages((prevMessages) => ({
      ...prevMessages,
      [resumeIndex]: 'Reason must be between 2 and 50 words.'
    }));
    return;
  } else {
    setErrorMessages((prevMessages) => ({
      ...prevMessages,
      [resumeIndex]: ''
    }));
  }
  try {
      // Fetch resume from axios
      const response1 = await axios.get(`${getpdfApiUrl}=${resumePaths[resumeIndex]}`, {
          responseType: 'arraybuffer',
      });
      console.log("response:",response1)
      if (response1.status === 200) {
          const extractedEmail = response1.headers['extractedemail'];
          const extractedPhoneNumber = response1.headers['extractedphonenumber'];
          const extractedName =response1.headers['extractedname']
          const resumeData = {
              resumeUrl,
              Extracted_Email: extractedEmail,
              extracted_phone_number:extractedPhoneNumber,
              jobDetailsId: jdId,
              action,
              recruiterFeedback: reasonInput,
              extracted_name:extractedName,
              address:'1233' ,
              summaries: summaries[resumeIndex],
          };

          // Process resume using fetch
      
            const response2 = await fetch(processResumeApiUrl, {

            
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(resumeData),
          });

          if (response2.ok) {
              const responseData = await response2.json();
              const isAlreadyAccepted = responseData.success && responseData.isAccepted;

              if (isAlreadyAccepted) {
                  alert('This resume is already accepted.');
              } else {
              
              }
          } else {
              const errorData = await response2.json();
              console.error('Received unexpected status code:', response2.status);
              console.error('Error response:', errorData);
              // Handle other status codes as needed
          }
      } else {
          window.alert('Failed to fetch resume from the backend API.');
      }
      if (action === 'accept') {
        setAcceptanceStatus(prevStatus => ({ ...prevStatus, [resumeIndex]: 'Accepted' }));
      } else if (action === 'reject') {
        setAcceptanceStatus(prevStatus => ({ ...prevStatus, [resumeIndex]: 'Rejected' }));
      } else if (action === 'hold') {
        // await setAcceptanceStatus(resumeIndex, jdId);
        setAcceptanceStatus(prevStatus => ({ ...prevStatus, [resumeIndex]: 'On_Hold' }));

      }
  } catch (error) {
      console.error('Error fetching or processing resume:', error);
      window.alert('Failed to fetch or process resume from the backend API.');
  }
};


  
  
return (
  <div style={{height:'100vh',backgroundColor:'white'}}>
  <div style={{ display: 'grid',justifyContent:'flex-start'}}> 
  <div className="container" >
   
       <Toolbar >
             <IconButton onClick={handleBack} style={{ position: "absolute", top: "20px", color: "black" }}>
          <ArrowBackIcon   style={{ fontSize: "50px" }}/>
        </IconButton>
            <Typography style={{ color: "black" , width: "500px",marginTop:'70px',right:'400px',fontFamily:'Righteous',fontSize:'50px'}}>
            Candidates Resumes
          </Typography>
        </Toolbar>
     
    {resumePaths.length > 0 ? (
      <Table sx={{ width: '100%', margin: 'auto', border: '1px solid black', borderCollapse: 'collapse',marginTop:'10px' }}>
      <TableHead>
      <TableRow sx={{ backgroundColor: 'rgba(79, 55, 139, 1)',  border: '1px solid black'}}>
          <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid lightgray',textAlign:'center'}} >Resume Summary</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid lightgray',textAlign:'center',width:"20%" }}>Resume URL</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid lightgray',textAlign:'center'}}>Actions</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid lightgray',textAlign:'center'}}>Selection/Rejection (Reason)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {resumePaths.map((resumePath, index) => (
          <TableRow key={index} >
            
            <TableCell sx={{ border: '1px solid lightgray'}}>
              <ul className="resume-list" style={{ width: '900px'}}>
                {summaries[index] && <p>Summary: {summaries[index]}</p>}
               
                </ul>
            </TableCell >
            <TableCell sx={{ border: '1px solid lightgray'}}> 
             <a style={{ width: '0px'}} href={`${getpdfApiUrl}=${resumePath}`} target="_blank" rel="noopener noreferrer">
                  {resumeNames[index]}
                </a>
            </TableCell>
       
            
        <TableCell sx={{ border: '1px solid lightgray'}}>
            <button onClick={() => handleResume(index, jdId, 'accept')} className="accept-btn">
              {acceptanceStatus[index] === 'Accepted' ? 'Accepted' : 'Accept'}
            </button>
            <button onClick={() => handleResume(index, jdId, 'reject')} className="reject-btn">
              {acceptanceStatus[index] === 'Rejected' ? 'Rejected' : 'Reject'}
            </button>
           
            <button onClick={() => handleResume(index, jdId, 'hold')} className="on-hold-btn">
              {acceptanceStatus[index] === 'On_Hold' ? 'On_Hold' : 'Hold'}
            </button>
          </TableCell>
          <TableCell style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
 
              <TextField
                id={`reason-for-${index}`}
                variant="outlined"
                 placeholder='Enter Text' 
                size="large"
                required
                sx={{ width: '300px',padding: '20px' }} 
              />
             {errorMessages[index] && (
                        <Typography color="error" variant="body2">
                          {errorMessages[index]}
                        </Typography>
                      )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    ) : (
      <p>No resumes to display.</p>
    )}
    {acceptedResumes.length > 0 && (
      <div>
      </div>
    )}
  </div>
  <Button variant="contained" color="primary" onClick={handleBack} style={{ marginTop: '0px' ,width:'10%',left:'800px',borderRadius:'20px' , backgroundColor: 'rgba(79, 55, 139, 1)'}}>
						Go Back
				</Button>
  </div>
  </div>
);
}


export default ResumeDisplay;














