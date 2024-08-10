


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Typography,
    Button,
    FormControl,
    CircularProgress, TextField, AppBar, Box, Toolbar, IconButton, Container,Dialog,DialogTitle,DialogContent
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styled from 'styled-components';
import { getEmailTemplate } from '../../emailTemplates/emailTemplate'; 



const StyledContainer = styled(Container)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 70vh;
  
`;

const StyledForm = styled.form`
    width: 500px;
    padding: 20px;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;

`;


function ResetPasswordForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const forgotPasswordApiUrl = process.env.REACT_APP_FORGOT_PASSWORD_API;
    const sendEmailApiUrl = process.env.REACT_APP_SEND_EMAIL_API;
    const resetpasswordApiUrl = process.env.REACT_APP_RESET_PASSWORD_API;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [step, setStep] = useState(1);


        const handleSendOTP = async () => {
            console.log("entered sendOTP")
            // setIsLoading(true);
            try {
                const response = await axios.post(forgotPasswordApiUrl, { email });
                console.log("response: " , response)
                if (response.data.success) {
                    setErrorMessage("");
                    setOtpSent(true);
                    setStep(2);
                    setResponseMessage("OTP sent successfully to your email.");
                    setDialogOpen(true);

                const { subject, body } = getEmailTemplate('sendOTP');
                const emailBody = body.replace('${otp}', response.data.otp);

                console.log("Email Body:", emailBody);

                // Send email using the API endpoint
                await axios.post(sendEmailApiUrl, {
                    candidateEmail: [email],
                    subject: subject,
                    body: emailBody,
                });

                } else {
                    setErrorMessage("Unable to send OTP.");
                    setDialogOpen(true);
                }
            } catch (error) {
                console.error('Error sending OTP:', error); 
                setErrorMessage("Please enter valid Emails..Error sending OTP.");
                setDialogOpen(true);
            }
            // setIsLoading(false);
        };

        const handleVerifyOTP = () => {
            // Implement OTP verification logic here
            setStep(3);
            // Simulating OTP verification
            setTimeout(() => {
              setOtpVerified(true);
              // setIsLoading(false);
            }, 1000);
          };
        

    const handleResetPassword = async (event) => {
        event.preventDefault();
        // Password validation
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setResponseMessage("Passwords do not match");
            setDialogOpen(true);
            return;
        }
        try {
            const response = await axios.post(resetpasswordApiUrl, {
                email,
                otp,
                newPassword,
            });
            if (response.data.success) {
                setResetSuccess(true);
                setErrorMessage("");

         const { subject, body } = getEmailTemplate('resetPasswordSuccess');

         // Send email using the API endpoint
         await axios.post(sendEmailApiUrl, {
             candidateEmail: [email],
             subject: subject,
             body: body,
         });
            } else {
                setErrorMessage("Unable to reset password.");
                setDialogOpen(true);
            }
        } catch (error) {
            setErrorMessage("Error resetting password.");
            setDialogOpen(true);
        }
        setIsLoading(false);
    };
    if (resetSuccess) {
        alert("Successfully changed the password");
        navigate("/");
    }

    const handleBack = () => {
        if (step === 1) {
          navigate("/")
        } else {
          setStep(step - 1);
          if (step === 2) {
            setOtpSent(false);
          } else if (step === 3) {
            setOtpVerified(false);
          }
        }
      };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

return (
    <div style={{ display: "flex" ,height: "100vh" }}>
 {/* pink half */}
		
		<div style={{ flex: 1, backgroundColor: 'rgba(232, 222, 248, 1)', color: 'black' }}>
				
		<div style={{ padding: "20px" }}>
					
			<div style={{ flex: 1, backgroundColor: 'transparent', display: "flex", flexDirection: "column",marginTop:'300px', marginRight:'10px', color: "black" }}>

				<h1 id="blueHeading" style={{ fontSize: "3.5rem", marginBottom: "20px" ,marginRight:'10px',fontFamily:'Righteous'}}>Resourcing-Bot</h1>
				<p id="blueText" style={{ fontSize: "2rem", width: "70%" }}>Your one-stop solution for effortless hiring</p>
			<div>
		</div>
		</div>
			<style>
			{`
			#blueHeading {
			animation: zoomIn 3s ease-in-out;
			transform-origin: left center; 
			}
			#blueText {
				animation: zoomIn 3s ease-in-out;
				transform-origin: right center;
			}
			@keyframes zoomIn {
			from {
				opacity: 0;
				transform: scale(0); 
			}
			to {
				opacity: 1;
				transform: scale(1); 
			}
			}
			`}
			</style>
		</div>
		</div>


        <div style={{ flex: 1, backgroundColor: "white" }}>
      <StyledContainer>
        <Toolbar>
          <Box>
          <IconButton onClick={handleBack} style={{ position: "absolute", top: "300px", left: "50px", color: "black", }}>
              <ArrowBackIcon style={{ fontSize: "50px" }} />
            </IconButton>
            <Typography
              style={{ color: "black",marginLeft: "30px", fontFamily: "Righteous", fontSize: "50px", marginTop: "350px" ,justifyContent:'center     '}}>
              Forgot Password
            </Typography>
          </Box>
        </Toolbar>
        <StyledForm onSubmit={handleResetPassword}>
          {!otpSent && !otpVerified && (
            <TextField
              label="Email Id"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="youremail@gmail.com"
              required
              style={{ marginBottom: "15px", width: "80%" }}
            />
          )}
          {!otpSent && !otpVerified && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendOTP}
              disabled={!email || isLoading}
              style={{ marginBottom: "15px", width: "80%",backgroundColor:"rgba(79, 55, 139, 1)",borderRadius:'20px',color:'white'}}

            >
              Verify
            </Button>
          )}
          {otpSent && !otpVerified && (
            <>
              <TextField
                label="OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
                style={{ marginBottom: "15px", width: "80%" }}
              />
               <Box display="flex" justifyContent="space-between" width="80%">
              <Button
                onClick={handleSendOTP}
                disabled={isLoading}
                style={{ marginBottom: "15px", width: "48%",borderRadius:'20px',color:'rgba(79, 55, 139, 1)',border: '1px solid rgba(79, 55, 139, 1)'}}
              >
                Resend OTP
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={!otp || isLoading}
                style={{ marginBottom: "15px", width: "48%",backgroundColor:"rgba(79, 55, 139, 1)",borderRadius:'20px',color:'white'}}
              >
                Confirm OTP
              </Button>
              </Box>
            </>
          )}
          {otpVerified && (
            <>
              <TextField
                label="New Password"
                placeholder="Enter Password"
                type="password"
                name="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                style={{ marginBottom: "15px", width: "80%" }}
              />
              <TextField
                label="Confirm Password"
                placeholder="Enter Password Again"
                type="password"
                name="confirm-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                style={{ marginBottom: "15px", width: "80%" }}
              />
            </>
          )}

          {errorMessage && <div className="error">{errorMessage}</div>}
          <FormControl fullWidth margin="normal">
            {resetSuccess && (
              <Typography variant="body1" className="success">
                Password reset successful
              </Typography>
            )}
            {isLoading ? (
              <CircularProgress />
            ) : (
              otpVerified && (
                <Box display="flex" justifyContent="center" width="100%">

                <Button
                  type="submit"
                  id="reset-btn"
                  style={{ marginBottom: "15px",backgroundColor:"rgba(79, 55, 139, 1)",borderRadius:'20px',color:'white'}}

                  disabled={!otp}
                >
                  Reset Password
                </Button>
                </Box>
              )
            )}
        
          </FormControl>
        </StyledForm>
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
                    <DialogContent>
                        <Typography sx={{fontSize:'20px'}}>{errorMessage}{responseMessage}</Typography>
                        <Button onClick={handleDialogClose} color="primary">
                          Close
                        </Button>
                    </DialogContent>
                </Dialog>
      </StyledContainer>


            <br></br><br></br>
        </div>
    </div>
);
}
export default ResetPasswordForm;;

