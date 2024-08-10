

import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, CircularProgress, IconButton, Dialog,DialogActions,DialogContent} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SchedulingPage = ({candidateEmail, jdId}) => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [interviewers, setInterviewers] = useState([]); 
  console.log("interviewers:",interviewers)
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newInterviewer, setNewInterviewer] = useState('');
  const [open, setOpen] = useState(false);
  const fetchinterviewersApiUrl=process.env.REACT_APP_FETCH_INTERVIEWERS_API;
  const scheduleApiUrl=process.env.REACT_APP_SCHEDULE_API;


  useEffect(() => {
    if (jdId) {
      fetchInterviewers(jdId);
    }
  }, [jdId]);

 

const fetchInterviewers = async (jdId) => {
  try {
    const response = await axios.get(`${fetchinterviewersApiUrl}/${jdId}`);
    
    // Use the correct field name from the response
    const interviewerEmails = response.data.interviewerEmails || []; 

    console.log("Interviewers:", interviewerEmails);
    setInterviewers(interviewerEmails);
  } catch (error) {
    console.error('Error fetching interviewers:', error);
    setInterviewers([]); // Handle error case
  }
};



  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };


  const handleScheduling = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        console.error('Please select both date and time for the interview');
        return;
      }

    setLoading(true);

      const schedulingData = {
        jdId: jdId,
        candidateEmail: candidateEmail,
        interviewerEmails: interviewers,
        interview_time: `${selectedDate}T${selectedTime}:00`
      };

      const response = await axios.post(scheduleApiUrl, schedulingData);
      console.log('Interview scheduled successfully:', response.data);

      setIsScheduled(true);
      setOpen(true);

      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      console.error('Error scheduling interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (location.state && location.state.fromEditJobDescription) {
      navigate(-1); 
    } else {
      navigate(-0); 
    }
};

  const handleAddInterviewer = () => {
    setInterviewers([...interviewers, newInterviewer]);
    setNewInterviewer('');
  };

  const handleDeleteInterviewer = (index) => {
    const updatedInterviewers = interviewers.filter((_, i) => i !== index);
    setInterviewers(updatedInterviewers);
  };


  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',justifyContent:'flex-start' }}>
      
        <IconButton onClick={handleBack} style={{ position: 'absolute', marginTop: '50px', color: 'black' }}>
      <ArrowBackIcon style={{ fontSize: '50px' }} />
    </IconButton>
        <Typography style={{ color: 'black', width: '100%', marginTop: '100px', fontFamily: 'Righteous', fontSize: '40px' }}>
          Scheduling Interview
        </Typography>

       <div style={{ marginBottom: '20px', width: '50%',justifyContent:'center' ,marginTop:'50px'}}>
      <TextField
        label="Candidate Email"
        value={candidateEmail}
        disabled
        style={{ marginBottom: '20px', width: '50%'}}
      />
   
   <br></br><br></br>

  {interviewers.map((interviewer, index) => (
    <div key={index} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
      <TextField
        label={`Interviewer ${index + 1}`}
        value={interviewer}
        disabled
        fullWidth
        style={{ marginBottom: '20px', width: '50%'}}
      />
      <IconButton onClick={() => handleDeleteInterviewer(index)} aria-label="delete">
        <DeleteIcon />
      </IconButton>
    </div>
  ))}

  <TextField
    label="New Interviewer Email"
    value={newInterviewer}
    onChange={(e) => setNewInterviewer(e.target.value)}
    fullWidth
    style={{ marginBottom: '20px', width: '50%'}}
  />
  <br></br>
  
 
  <Button  onClick={handleAddInterviewer} style={{ marginTop: '20px',color:"white",borderRadius:'20px',backgroundColor:'rgba(79, 55, 139, 1)'}} >Add Interviewer</Button>
 
  <br></br>
  <br></br>

        <TextField
    
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          fullWidth
          required
          style={{ marginBottom: '20px', width: '50%'}}
        />
  
      <br></br>
      <br></br>
        <TextField
          type="time"
          value={selectedTime}
          onChange={handleTimeChange}
          fullWidth
          required
          style={{ marginBottom: '20px', width: '50%'}}
        />
     
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        {isScheduled && (
          <Typography variant="body1" style={{ color: 'green',font:'20px', marginBottom: '20px' }}>
            Interview scheduled successfully!
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>


<br></br><br></br>

<Button style={{justifyContent:'flex-end',alignContent:'flex-end',borderRadius:'20px',backgroundColor:'rgba(79, 55, 139, 1)'}}variant="contained" onClick={() => handleScheduling(candidateEmail, jdId)} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Schedule Interview'}
        </Button>
   
      </div>
   
    </div>
  );
};

export default SchedulingPage;






