import React, { useState, useEffect } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import axios from "axios";
import { Button,Toolbar,Box,Typography,TableContainer,TableCell,Paper,Table,TableHead,TableRow,TableBody,IconButton} from "@mui/material";
import '../../styles/HiringdashBoard.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Pagination from  '../../utils/Pagination.js';
import JobDescriptionForm from './JobDescriptionForm.js';
import JDDetails from "../shared/JDDetails.js";
function ArchivedJdsPage() {
  const location = useLocation();
  const navigate = useNavigate(); 

  const [archivedJds, setArchivedJds] = useState([]);
  const { hiringManagerEmail, jds } = location.state || {};
  const [step, setStep] = useState(1);
  const [isEditJDOpen, setIsEditJDOpen] = useState(false);
  const [selectedJD, setSelectedJD] = useState(null);
  const [isViewJdDetailsOpen, setIsViewJdDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [fromEditJobDescription, setFromEditJobDescription] = useState(false);


  const deleteJDApiUrl = process.env.REACT_APP_DELETE_JD_API;
  const archivedJdsApiUrl = process.env.REACT_APP_ARCHIVE_JDS_API;


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



  useEffect(() => {
    // Fetch archived JDs when the component mounts
    fetchArchivedJds();
  }, []);

   
  async function fetchArchivedJds() {
    try {
      const response = await axios.get(`${archivedJdsApiUrl}/${hiringManagerEmail}`);
      setArchivedJds(response.data);
    } catch (error) {
      console.error("Error fetching archived Jds:", error);
    }
  }
 
  const handleUnarchieveClick = async (jdId) => {
    try {
      // Send request to mark the job description as active
      const response = await axios.put(`${deleteJDApiUrl}/${jdId}`, { is_active: true });
      console.log("response:", response);
      if (response.status === 200) {
        // Remove the unarchived JD from the state
        setArchivedJds(prevJds => prevJds.filter(jd => jd._id !== jdId));
        window.location.reload();
      } else {
        throw new Error("Failed to Unarchive JD");
      }
    } catch (error) {
      console.error("Error Unarchiving JD:", error);
    }
  };


  const openTab = (tabName, jd = null) => {
    setActiveTab(tabName);
  
    if (tabName === "job-description-form") {
      setIsEditJDOpen(true); 
      setSelectedJD(selectedJD); 
      setIsViewJdDetailsOpen(false); 
      setFromEditJobDescription(true);
    } else  if (tabName === "view-job-description") {
      setIsViewJdDetailsOpen(true);
      setSelectedJD(selectedJD);
      setSelectedJD({ ...jd, userRole: 'hiringManager', });
    }
    else {
      setIsEditJDOpen(false); 
      setIsViewJdDetailsOpen(false); 
    }
    };



  
const handleEditClick = (selectedJD) => {
  setIsEditJDOpen(true); 
  setSelectedJD(selectedJD);
  setActiveTab('')
};

  const isExpired = (expirationTime) => {
    return new Date(expirationTime) < new Date();
  };


const handleViewJD = (selectedJD) => {
  openTab("view-job-description", selectedJD);
};

  const handleBack = () => {
    if (location.state && location.state.fromEditJobDescription) {
      navigate(-1); // Navigate back one step for edit job description
    } else {
      navigate(-0); 
    }
  };
    // Calculate counts
    const archivedCount = jds.filter((jd) => !isExpired(jd.expiration_time)).length;
    const expiredCount = jds.filter((jd) => isExpired(jd.expiration_time)).length;
return (
  <div>

    {!isEditJDOpen && !isViewJdDetailsOpen && (
        <React.Fragment>
    <Toolbar>
      <IconButton onClick={handleBack} style={{ position: "absolute", top: "-30px", left: "30px", color: "black" }}>
        <ArrowBackIcon style={{ fontSize: "50px" }} />
      </IconButton>
      <Typography variant="h5" style={{ marginTop: '20px', color: "black", fontFamily: 'Righteous', fontSize: '40px', fontWeight: 'bold' }}>
        Archived Job Descriptions
      </Typography>
    </Toolbar>
    <Box sx={{ m: 2 }}>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '50px', width: '100%' }}>
        <Button style={{ width: "20%", backgroundColor: 'rgba(232, 222, 248, 1)', border: '0.5px solid rgba(79, 55, 139, 1)', borderRadius: '20px', color: "rgba(79, 55, 139, 1)" }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
            {archivedCount}
          </Typography>
          Archived JDs
        </Button>
        <Button style={{ width: "20%", backgroundColor: 'rgba(232, 222, 248, 1)', border: '0.5px solid rgba(79, 55, 139, 1)', borderRadius: '20px', color: "rgba(79, 55, 139, 1)" }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
            {expiredCount}
          </Typography>
          Expired JDs
        </Button>
      </div>
     
          <TableContainer component={Paper}>
            <Table style={{ width: "90%", alignContent: 'center' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: "rgba(79, 55, 139, 1)", color: 'white', width: "20%" }}>JD ID</TableCell>
                  <TableCell sx={{ backgroundColor: "rgba(79, 55, 139, 1)", color: 'white', width: "20%" }}>Job Status</TableCell>
                  <TableCell sx={{ backgroundColor: "rgba(79, 55, 139, 1)", color: 'white', width: "20%" }}>Job Role</TableCell>
                  <TableCell sx={{ backgroundColor: "rgba(79, 55, 139, 1)", color: 'white', width: "20%" }}>Expiration Time</TableCell>
                  <TableCell sx={{ backgroundColor: "rgba(79, 55, 139, 1)", color: 'white', width: "10%" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedJds.map((jd, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row" sx={{ border: '1px solid lightgray', textAlign: 'center' }}>
                      <Button
                        onClick={() => handleViewJD(jd)}
                        sx={{ textDecoration: 'underline', ':hover': { textDecoration: 'underline' } }}>
                        {jd.jdID}
                      </Button>
                    </TableCell>
                    <TableCell className="table-header-cell">
                      {isExpired(jd.expiration_time) ? (
                        <Button style={{ backgroundColor: 'gray', borderRadius: "10px", color: "white" }}> Expired JD</Button>
                      ) : (
                          <Button style={{ backgroundColor: 'gray', borderRadius: "10px", color: "white" }}> Archived</Button>
                        )}
                    </TableCell>
                    <TableCell className="table-header-cell">{jd.jobRole}</TableCell>
                    <TableCell className="table-header-cell">{jd.expiration_time}</TableCell>
                    <TableCell className="table-header-cell">
                      {isExpired(jd.expiration_time) ? (
                        <IconButton variant="contained" style={{ backgroundColor: 'rgba(232, 222, 248, 1)', borderRadius: '20px' }} onClick={() => handleEditClick(jd)}>
                          <EditIcon style={{ marginRight: '5px' }} />
                        </IconButton>
                      ) : (
                          <IconButton variant="contained" style={{ backgroundColor: "rgba(232, 222, 248, 1)", borderRadius: '20px' }} onClick={() => handleUnarchieveClick(jd._id)}>
                            <UnarchiveIcon />
                          </IconButton>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} totalPages={totalPages} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} />
    
    </Box>
      </React.Fragment>
    )}
    {isEditJDOpen && (
      <JobDescriptionForm
        jd={selectedJD}
        isEdit={isEditJDOpen}
        onClose={() => {
          setIsEditJDOpen(false);
        }}
      />
    )}

{isViewJdDetailsOpen && <JDDetails jdDetails={selectedJD} userRole="hiringManager"  />}

  </div>
);
}

export default ArchivedJdsPage;