import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

import { Typography, List, ListItem ,IconButton} from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ScreeningTestDetails = ({screeningID}) => {

    const [screeningTest, setScreeningTest] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getScreeningTest = async () => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_SCREENING_ID_API}/${screeningID}`, { screeningID });                
                setScreeningTest(response.data);
            } catch (error) {
                setError('Error fetching screening test data');
            } finally {
                setLoading(false);
            }
        };

        getScreeningTest();
    }, [screeningID]);

    const handleBack = () => {
        if (location.state && location.state.fromEditJobDescription) {
          navigate(-1); 
        } else {
          navigate(-0); 
        }
      };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!screeningTest) return <div>No data available</div>;

    return (
        // <div style={{ textAlign: "flex-start", marginTop: "10px",alignItems:'flex-start'}}>
        <div style={{  marginTop: "10px"}}>
                <div style={{ textAlign: "flex-start", marginTop: "20px", alignItems: 'flex-start' }}>
      <IconButton onClick={handleBack} style={{ position: "relative", color: "black", top: '10px' }}>
        <ArrowBackIcon style={{ fontSize: "50px" }} />
      </IconButton>
    </div>
            <Typography variant="h4">Screening Test Details</Typography>
            <br></br><br></br>
            <Typography variant="h6" color='primary' style={{fontWeight:'bold'}}>Job Role: {screeningTest.jobRole}</Typography>
            <Typography variant="h6" color='primary' style={{fontWeight:'bold'}}>Passing Score: {screeningTest.passingScore}</Typography>
            <div style={{marginTop:'100px',border:"5px solid rgba(232, 222, 248, 1)",width:'100%',marginBottom:'200px'}}>
            <List>
                {screeningTest.questions.map((question) => (
                    <ListItem key={question._id}>
                        <div>
                            <Typography variant="h6" style={{fontWeight:'bold'}}>{question.questionText}</Typography>
                            <List>
                                {question.answerOptions.map((option, index) => (
                                    <ListItem key={index}>
                                        <Typography>{option}</Typography>
                                    </ListItem>
                                ))}
                            </List>
                            <Typography variant="body2" color="textSecondary">
                                <strong>Correct Answer:</strong> {question.correctAnswer}
                            </Typography>
                        </div>
                    </ListItem>
                ))}
            </List>
            </div>
        </div>
    );
};

export default ScreeningTestDetails;
