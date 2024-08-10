





import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Select, MenuItem ,AppBar,Box,Toolbar,IconButton} from '@mui/material';
import axios from 'axios';
import { useLocation,useNavigate } from 'react-router-dom';
import { Slider, FormControl, InputLabel,  } from '@mui/material';
import { reviewValues } from '../shared/dropdown_values';
import { getEmailTemplate } from '../../emailTemplates/emailTemplate'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const FeedbackForm = ({selectedCandidateEmail, jdId}) => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [candidateEmail, setCandidateEmail] = useState(selectedCandidateEmail || '');
  const [jdIds, setJdId] = useState(jdId || '');
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);
  const [previousPath, setPreviousPath] = useState('');
  const [programmingRating, setProgrammingRating] = useState(0);
  const [performanceRating, setPerformanceRating] = useState(0);
  const [reviewRating, setReviewRating] = useState('');
  const [areasOfInterest, setAreasOfInterest] = useState('');
  const [areasOfStrength, setAreasOfStrength] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState('');
  const [communicationSkills, setCommunicationSkills] = useState('');
  const [problemSolvingSkills, setProblemSolvingSkills] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const feedbackApiUrl = process.env.REACT_APP_FEEDBACK_API || "http://127.0.0.1:3004/feedback";
  const sendEmailApiUrl = process.env.REACT_APP_SEND_EMAIL_API;
 

  useEffect(() => {
    // Fetch jdId and candidateEmail from URL parameters if not provided as props
    if (!jdId || !selectedCandidateEmail) {
      const params = new URLSearchParams(location.search);
      const jdIdParam = params.get('jdId');
      const candidateEmailParam = params.get('candidateEmail');
      if (jdIdParam) setJdId(jdIdParam);
      if (candidateEmailParam) setCandidateEmail(candidateEmailParam);
    }
  }, [location.search, jdId, selectedCandidateEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = {
        jdId: jdId,
        candidateEmail: candidateEmail,
        feedback: feedback,
        feedbackStatus: feedbackStatus,
        programmingRating: programmingRating,
        performanceRating: performanceRating,
        reviewRating: reviewRating,
        areasOfInterest: areasOfInterest,
        areasOfStrength: areasOfStrength,
        technicalSkills: technicalSkills,
        communicationSkills: communicationSkills,
        problemSolvingSkills: problemSolvingSkills,
        suggestion: suggestion,
      };

      console.log(formData);

      // Send feedback data to the server
      await axios.post(feedbackApiUrl, formData);
      const loginUrl = process.env.REACT_APP_LOCAL_HOST_API;

    const emailTemplate = getEmailTemplate('interviewFeedback');

    console.log("Email Template:", emailTemplate);
    const emailData = {
      candidateEmail: [candidateEmail],
      subject: emailTemplate.subject.replace('USER_EMAIL', candidateEmail),
      body: emailTemplate.body.replace('${loginUrl}', loginUrl)
                              .replace('USER_EMAIL', candidateEmail),
    };

      // await axios.post('http://127.0.0.1:3004/sendEmail', emailData);
      
      await axios.post(sendEmailApiUrl, emailData);

      setSubmissionSuccess(true);
      setLoading(false);
      setFeedbackData(formData.feedbacks);
      window.location.href = previousPath;
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',justifyContent:'flex-start' }}>
      <div style={{ position: 'relative', marginLeft:'-150px',marginTop: '40px', alignItems: 'flex-start',justifyContent:'flex-start', color: 'black' ,width:'50%'}}>
    
        <IconButton onClick={handleBack}>
          <ArrowBackIcon style={{ fontSize: '50px',color:'black' }}/>
        </IconButton>
        <Typography>
          <h1> Feedback Form</h1>
        </Typography>

        </div> 
      <form onSubmit={handleSubmit} style={{ width: '50%', marginTop: "30px" }}>
        <TextField
           type="text"
           name="companyName"
           required
           fullWidth
           style={{ marginBottom: "20px" }}
           onChange={(e) => setCandidateEmail(e.target.value)}
           value={candidateEmail}
         />
        <TextField
          label="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          multiline
          fullWidth
          required
          style={{ marginBottom: '20px' }}
        />
        <TextField
          label="areasOfInterest"
          value={areasOfInterest}
          onChange={(e) => setAreasOfInterest(e.target.value)}
          multiline
          rows={4}
          fullWidth
          required
          style={{ marginBottom: '20px' }}
        />
        <TextField
          label="areasOfStrength"
          value={areasOfStrength}
          onChange={(e) => setAreasOfStrength(e.target.value)}
          multiline
          fullWidth
          required
          style={{ marginBottom: '20px' }}
        />
        <TextField
          label="technical_skills"
          value={technicalSkills}
          onChange={(e) => setTechnicalSkills(e.target.value)}
          multiline
          fullWidth
          required
          style={{ marginBottom: '20px' }}
        />

        <FormControl fullWidth style={{ marginBottom: "20px", position: "relative" }}>
          {reviewRating === "" && (
            <InputLabel
              id="review-rating-label"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
              required
            >
              Overall Performance
            </InputLabel>
          )}
          <Select
            labelId="review-rating-label"
            id="review-rating-label"
            name="review-rating-label"
            value={reviewRating}
            onChange={(e) => setReviewRating(e.target.value)}
            fullWidth
            required
            displayEmpty
          >
            {reviewValues.map((review) => (
              <MenuItem key={review.value} value={review.value}>{review.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" gutterBottom component="div" style={{ marginBottom: '20px' }}>
          Programming Rating:
        </Typography>
        <FormControl fullWidth required style={{ marginBottom: '20px' }}>
          <Slider
            value={programmingRating}
            onChange={(e, newValue) => setProgrammingRating(newValue)}
            aria-labelledby="programming-rating-label"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={0}
            max={10}
          />
        </FormControl>

        <Typography variant="h6" gutterBottom component="div" style={{ marginBottom: '20px' }}>
          Performance Rating:
        </Typography>
        <FormControl fullWidth required style={{ marginBottom: '20px' }}>
          <Slider
            value={performanceRating}
            onChange={(e, newValue) => setPerformanceRating(newValue)}
            aria-labelledby="performance-rating-label"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={0}
            max={10}
          />
        </FormControl>

        <Typography variant="h6" gutterBottom component="div" style={{ marginBottom: '20px' }}>
          Communication Skills:
        </Typography>
        <FormControl fullWidth required style={{ marginBottom: '20px' }}>
          <Slider
            value={communicationSkills}
            onChange={(e, newValue) => setCommunicationSkills(newValue)}
            aria-labelledby="communication-rating-label"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={0}
            max={10}
          />
        </FormControl>

        <Typography variant="h6" gutterBottom component="div" style={{ marginBottom: '20px' }}>
          Problem Solving Skills
        </Typography>
        <FormControl fullWidth required style={{ marginBottom: '20px' }}>
          <Slider
            value={problemSolvingSkills}
            onChange={(e, newValue) => setProblemSolvingSkills(newValue)}
            aria-labelledby="problem-rating-label"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={0}
            max={10}
          />
        </FormControl>
        <TextField
          label="Any  suggestion"
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          multiline
          rows={2}
          fullWidth
          required
          style={{ marginBottom: '20px' }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          style={{ marginBottom: '20px' }}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
        {submissionSuccess && (
          <Typography variant="body1" style={{ color: 'green', marginBottom: '20px', textAlign: 'center' }}>
            Feedback submitted successfully!
          </Typography>
        )}
      </form>
    </div>
  );
};

export default FeedbackForm;
