


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleLogin from 'react-google-login';
import axios from "axios";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
	Button,
	TextField,
	Typography,IconButton,InputAdornment,Dialog,DialogContent
} from "@mui/material";

import "../../styles/App.css";

function Login() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const loginApiUrl = process.env.REACT_APP_LOGIN_API;
	const google_FB_GIT_loginApiUrl = process.env.REACT_APP__SOCIAL_LOGIN_API;  
	const [responseMessage, setResponseMessage] = useState("");
	const navigate = useNavigate();
	const [openDialog, setOpenDialog] = useState(false); // State for dialog visibility
	const [dialogMessage, setDialogMessage] = useState(""); // State for dialog message
  

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSignup = () => {
		navigate("/register");
	};

	const reset = () => {
		navigate("/ResetPasswordForm");
	};



	const handleNavigation = async (email) => {
	try {
		// Send email to backend for verification
		const backendResponse = await axios.post(google_FB_GIT_loginApiUrl, { email });

		if (backendResponse.data.success) {
			const userType = backendResponse.data.userType;

			// Redirect based on the user type
			switch (userType) {
				case "recruiter":
					navigate("/recruiter-dashboard");
					break;

				case "interviewer":
					navigate("/interviewer-dashboard");
					break;

				case "hiringManager":
					navigate("/hiring-dashboard");
					break;

				case "admin":
					navigate("/admin-dashboard");
					break;

				default:
					console.log("Invalid user type.");
			}
		} else {
			console.log("Email not found in the database.");
			setResponseMessage("Email not found in the database.");
		}
	} catch (error) {
		console.error("Error:", error);
	}
};



const responseGoogle = async (response) => {
	try {
		console.log("Google response:", response);

		if (response && response.profileObj && response.profileObj.email) {
			await handleNavigation(response.profileObj.email);
		} else {
			console.log("Google response does not contain profileObj or email.");
		}
	} catch (error) {
		console.error("Error:", error);
	}
};

const onFailure = (error) => {
		if (error.error === "popup_closed_by_user") {
			alert("Sign-in popup was closed. Please try again.");
		} else {
			console.log("Github Sign-In failed:", error);
		}
	}; 
	
	
const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch(loginApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const data = await response.json();
            const userType = data.user.userType;
            const jds = data.jds;
			const name = data.user.name;
			const phone = data.user.phone;
			const email = data.user.email;
			const token = data.token;

            // Store user email in localStorage
            localStorage.setItem('email', data.user.email);
			localStorage.setItem('token', token);

            // Navigate and pass relevant data based on user type
            switch (userType) {
                case "recruiter":
                    navigate("/recruiter-dashboard", {
                        state: {
                            jds,
                            email: email,
							name: name,
							phone: phone,
							userType,
							initialScreeningIds: data.screeningIDs,
                        },
                    });
                    break;

                case "interviewer":
                    navigate("/interviewer-dashboard", {
                        state: {
							email: email,
							name: name,
							phone: phone,
                            jds,
							userType,
                        },
                    });
                    break;

                case "hiringManager":
                    navigate("/hiring-dashboard", {
                        state: {
                            email: email,
							name: name,
							phone: phone,
                            jds,
							userType,
                        },
                    });
                    break;

                case "admin":
                    navigate("/admin-dashboard", {
                        state: {
                            email: email,
							name: name,
							phone: phone,
							userType,
							initialPendingUsers: data.pendingUsers,
							initialApprovedUsers: data.approvedUsers,
							initialRejectedUsers: data.rejectedUsers,
                        },
                    });
                    break;

                default:
                    handleDialog("Invalid user type.");
            }
        } else {
            const errorMessage = await response.text();
            console.error("Error:", errorMessage);
            handleDialog(errorMessage);
        }

    } catch (error) {
        console.error("Error:", error);
        handleDialog("Error: " + error.message);
    }
};

const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
	

  const handleDialog = (message) => {
    setDialogMessage(message);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
        {/* White half */}
        <div style={{ flex: 1, backgroundColor: "white"}}>
            {/* Content for the white half */} 			
			<form
				id="loginForm"
				onSubmit={handleSubmit}
				style={{ width: "300px", margin: "0 auto", marginTop: "200px" ,marginLeft:'90px' }}
			>
				<h1 style={{ margin: "0 auto", marginTop: "200px" ,marginLeft:'10px' ,fontFamily:'Righteous'}}>Sign in</h1>
				<TextField
					label="Email"
					id="email"
					name="email"
					type="email"
					value={formData.email}
					onChange={handleChange}
					required
					autoComplete="email"
					fullWidth
					margin="normal"
					sx={{ width: "500px" }}
				/>
			
				  <TextField
					label="Password"
					id="password"
					name="password"
					type={showPassword ? 'text' : 'password'}
					value={formData.password}
					onChange={handleChange}
					required
					autoComplete="current-password"
					fullWidth
					margin="normal"
					sx={{ width: "500px" }}
					InputProps={{
						endAdornment: (
						<InputAdornment position="end">
							<IconButton onClick={togglePasswordVisibility} edge="end">
							{showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
							</IconButton>
						</InputAdornment>
						)
					}}
					/>
				<Typography >Forgot Password?
					<Button className="forgot-password-btn" onClick={reset}  style={{color:"rgba(79, 55, 139, 1)"}}>Click Here</Button>
				</Typography>
			<br></br>
		
				<Button variant="contained" type="submit"  style={{ marginTop: "20px" ,borderRadius:'20px',backgroundColor:'rgba(79, 55, 139, 1)'}} sx={{ width: "500px" ,}}>
					Login
				</Button>
				<br></br>
			
			<div style={{ width: "200px",  height: "40px",   borderRadius: "20px",overflow: "hidden", border: "1px solid gray", marginTop:'30px',marginLeft:"180px" }}>
				<GoogleLogin
				clientId="320668170244-e1pjdbp6jpbutb6vppmr32tvna8t74ak.apps.googleusercontent.com"
				buttonText="SignIn with Google"
				onSuccess={responseGoogle}
				onFailure={onFailure}
				cookiePolicy={"single_host_origin"}
				style={{ width: "100%", borderRadius: "20px" }}/>
			</div>
		
			</form>

			<div id="responseMessage" style={{ marginTop: "20px", color: "red" }}>
				{responseMessage}
			</div>


		    <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogContent>
            <Typography>{dialogMessage}</Typography>
          </DialogContent>
        </Dialog>
		<br></br>
		<Typography style={{marginLeft:'200px'}}> Don't have an account yet!
		<Button className="link-btn" onClick={handleSignup}  style={{color:"rgba(79, 55, 139, 1)"}}>Register here</Button>
		</Typography>

            <br></br><br></br>
        </div>
    </div>
);
}
export default Login;

