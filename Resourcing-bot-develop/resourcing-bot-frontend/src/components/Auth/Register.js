

import React, { useState,useEffect } from "react";
import GoogleLogin from 'react-google-login'; 
import { useNavigate } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEmailTemplate } from '../../emailTemplates/emailTemplate'; 
import {
	Button,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Typography,Dialog,DialogTitle,DialogContent,DialogActions,IconButton,InputAdornment,Box
} from "@mui/material";

function RegistrationForm() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		phone: "",
		userType: "",
	});
	const registerApiUrl = process.env.REACT_APP_REGISTER_API;
    const sendemailApiUrl = process.env.REACT_APP_SEND_EMAIL_API || "http://127.0.0.1:3004/sendEmail";
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showUserTypeDialog, setShowUserTypeDialog] = useState(false); // social register
	const [responseMessage, setResponseMessage] = useState("");
	const navigate = useNavigate();
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogMessage, setDialogMessage] = useState(''); 
	useEffect(() => {
		const styleTag = document.createElement('style');
		styleTag.innerHTML = `
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
		  #blueHeading, #blueText {
		
			transform-origin: left center;
		  }
		`;
		document.head.appendChild(styleTag);
	  }, );
	  
	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === "phone" && value.length <= 10 && /^\d+$/.test(value)) {
			setFormData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		} else if (name !== "phone") {
			setFormData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		}
	};
	
	const sendEmailToAdmin = async (adminEmails, userType, userEmail) => {
        const loginUrl = process.env.REACT_APP_LOCAL_HOST_API;
 
			const { subject, body } = getEmailTemplate('registration');

			console.log("register email:",subject,body);
			
			// Construct the email body with the loginUrl
			const emailBody = body.replace('${loginUrl}', loginUrl)
								  .replace(' ${userType} ', userType)
								  .replace(' ${userEmail} ', userEmail);
								
		
		// Ensure adminEmails is an array
		const emailArray = Array.isArray(adminEmails) ? adminEmails : [adminEmails];
		console.log("emailArray: ",emailArray);

		const formattedEmails = emailArray.flatMap(email => email.split(',').map(e => e.trim()));
		console.log("formattedEmails: ",formattedEmails);


        // Prepare data for sending email
        const emailData = {
            candidateEmail: formattedEmails,
            subject: subject,
            body: emailBody
        };
        try {
            const response = await fetch(sendemailApiUrl, {				
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });
    		console.log("response:",response)
            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData.message); // Log success message from backend
            } else {
                console.error('Error sending email:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };
    
	function generateRandomPassword(length) {
		const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let password = "";
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset[randomIndex];
		}
		return password;
	}

	function generateRandomPhoneNumber() {
		const areaCode = Math.floor(100 + Math.random() * 900); 
		const firstPart = Math.floor(100 + Math.random() * 900); 
		const secondPart = Math.floor(1000 + Math.random() * 9000); 
		return `(${areaCode}) ${firstPart}-${secondPart}`;
	}
				
	const responseGoogle = (response) => {
		console.log("Google response:", response);
		if (response && response.profileObj) {
			const { email, name } = response.profileObj;
	
			// Generate a random password and phone number
			const password = generateRandomPassword(8); 
			const phone = generateRandomPhoneNumber();
	
			setFormData((prevData) => ({
				...prevData,
				email: email,
				name: name,
				password: password,
				phone: phone
			}));
	
			setShowUserTypeDialog(true); // Show the user type selection dialog
		} else {
			console.log("Google response does not contain profileObj.");
		}
	};

		const handleCloseUserTypeDialog = () => {
		setShowUserTypeDialog(false); // Close the dialog
		};


			const onFailureGoogle = (error) => {
				if (error.error === "popup_closed_by_user") {
				// Inform the user about the popup closure
				alert("Sign-in popup was closed. Please try again.");
				} 
				else {
				// Handle other Google sign-in errors
				console.log("Google Sign-In failed:", error);
				}
			};
			

    const handleSubmit = (event) => {
        event.preventDefault();

		  // Password validation
		  if (formData.password !== formData.confirmPassword) {
			setResponseMessage("Passwords do not match");
			return;
		}
    
        const requestOptions = {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" },
        };
        fetch(registerApiUrl, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setResponseMessage(data.message);
    
                if (data.success) {
                   
 
                    const adminEmails = data.adminEmails;
                    const adminEmailsString = adminEmails.join(', ');    
         
                    sendEmailToAdmin(adminEmailsString, formData.userType, formData.email);
				
					if (formData.userType === "hiringManager" || formData.userType === "recruiter" || formData.userType === "interviewer") {
                     
						  navigate("/registerSuccess");
                                        
                    } else if (formData.userType === "admin") {
                        navigate("/admin-dashboard");
                    } else {
                        console.log(data.message);
                    }
                }
                else {
                    // Handle error case where email is already present
                    if (data.message === "Email already exists") {
						navigate("/alreadyregistered");
                    } 
					else if (data.message === "Maximum number of admins reached. Registration restricted.") {
						setDialogMessage(data.message);
						setOpenDialog(true);
				}
				else {
                        console.error("Error:", data.message);
						setDialogMessage(data.message);
						setOpenDialog(true);
                    }
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            });
    };
	const togglePasswordVisibility = (field) => {
		if (field === 'password') {
			setShowPassword((prevShowPassword) => !prevShowPassword);
		} else if (field === 'confirmPassword') {
			setShowConfirmPassword((prevShowConfirmPassword) => !prevShowConfirmPassword);
		}
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		window.location.reload();
	  };

return (
    <div style={{ display: "flex", height: "100vh" }}>
       
        <div style={{ flex: 1, backgroundColor: 'rgba(232, 222, 248, 1)', color: 'white' }}>
        
            <div style={{ padding: "20px" }}>
				
			<div style={{ flex: 1, backgroundColor: 'transparent', display: "flex", flexDirection: "column",marginTop:'300px', marginRight:'10px', color: "black" }}>
        <h1 id="blueHeading" style={{ fontSize: "3.5rem", marginBottom: "20px" ,marginRight:'10px',fontFamily:'Righteous'}}>Resourcing-Bot</h1>
        <p id="blueText" style={{ fontSize: "2.5rem", width: "70%" }}>Your one-stop solution for effortless hiring</p><div>
   
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
		 <div style={{ flex: 1, backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", marginRight: '10px', position: "relative" }}>
        <IconButton onClick={() => navigate("/")} style={{ position: "absolute", top: "100px", left: "200px", color: "black" }}>
          <ArrowBackIcon   style={{ fontSize: "50px" }}/>
        </IconButton>
            <form onSubmit={handleSubmit} style={{ padding: "20px", color: "black" , width: "500px"}}>
			<Typography style={{ color: "black" , width: "500px",right:'400px',fontFamily:'Righteous',fontSize:'20px'}}>
					<h1 >New User Registration</h1></Typography>
					<TextField
						id="name"
						name="name"
						label="Name"
						value={formData.name}
						onChange={handleChange}
						fullWidth
						style={{ marginBottom: "15px" }}
					/>
					<TextField
						id="email"
						name="email"
						label="Email"
						type="email"
						value={formData.email}
						onChange={handleChange}
						fullWidth
						style={{ marginBottom: "15px" }}
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
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={() => togglePasswordVisibility('password')} edge="end">
										{showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					<TextField
						label="Confirm Password"
						id="confirmPassword"
						name="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						value={formData.confirmPassword}
						onChange={handleChange}
						required
						autoComplete="current-password"
						fullWidth
						margin="normal"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={() => togglePasswordVisibility('confirmPassword')} edge="end">
										{showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					  
					<TextField
						id="phone"
						name="phone"
						label="Phone Number"
						type="tel"
						value={formData.phone}
						onChange={handleChange}
						fullWidth
						style={{ marginBottom: "15px" }}
					/>
					<FormControl fullWidth style={{ marginBottom: "15px", position: "relative" }}>
						{formData.userType === "" && (
							<InputLabel
							id="userType-label"
							style={{ position: "absolute", top: 0, left: "15px", transform: "translate(0, 50%)", pointerEvents: "none" }}
							>
							User Type
							</InputLabel>
						)}
						<Select
							labelId="userType-label"
							id="userType"
							name="userType"
							value={formData.userType}
							onChange={handleChange}
							style={{ minWidth: "200px", }}
						    MenuProps={{
								PaperProps: {
								  sx: {
									'& .MuiMenuItem-root:hover': {
									  backgroundColor: 'rgba(232, 222, 248, 1)',
									},
								  },
								},
							  }}

						>
							<MenuItem value="">Select</MenuItem>

							<MenuItem value="hiringManager">Hiring Manager</MenuItem>
							<MenuItem value="recruiter">Recruiter</MenuItem>
							<MenuItem value="interviewer">Interviewer</MenuItem>
							<MenuItem value="admin">Admin</MenuItem>


						</Select>
					</FormControl>
				
		 
		  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" marginTop="20px">
				<Button
					variant="contained"
					type="submit"
					color="secondary"
					style={{ borderRadius: "20px", marginLeft: "0px", height: "40px",  backgroundColor:"rgba(79, 55, 139, 1)"}} // Set height
					sx={{ width: "200px" }}
				>
					Register
				</Button>
				<Dialog open={openDialog} onClose={handleCloseDialog}>
									<DialogTitle>Error</DialogTitle>
									<DialogContent>
										<Typography>{dialogMessage}</Typography>
									</DialogContent>
									<DialogActions>
										<Button onClick={handleCloseDialog} color="primary">
											Close
										</Button>
									</DialogActions>
								</Dialog>
				<div style={{width: "200px",height: "40px",marginLeft: "5px",borderRadius: "20px",overflow: "hidden",border: "1px solid gray",display: "flex",alignItems: "center", justifyContent: "center"  }}>
					<GoogleLogin
					clientId="320668170244-e1pjdbp6jpbutb6vppmr32tvna8t74ak.apps.googleusercontent.com"
					buttonText="Register with Google"
					onSuccess={responseGoogle}
					onFailure={onFailureGoogle}
					cookiePolicy={"single_host_origin"}
					style={{ width: "100%", borderRadius: "20px" }}
					/>
				</div>
			</Box>

						

				</form>
			
				{/* User type selection dialog */}
				<Dialog open={showUserTypeDialog} onClose={handleCloseUserTypeDialog}>
                    <DialogTitle>Select User Type</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth>
                            <InputLabel id="userType-label">User Type</InputLabel>
                            <Select
                                labelId="userType-label"
                                id="userType"
                                name="userType"
                                value={formData.userType}
                                onChange={handleChange}
                                fullWidth
                            >
                                <MenuItem value="">Select</MenuItem>
                                <MenuItem value="hiringManager">Hiring Manager</MenuItem>
                                <MenuItem value="recruiter">Recruiter</MenuItem>
                                <MenuItem value="interviewer">Interviewer</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUserTypeDialog} color="primary">Cancel</Button>
                        <Button onClick={handleSubmit} color="primary">Submit</Button>
                    </DialogActions>
                </Dialog>
				
        </div>
    </div>
			);
		}

		export default RegistrationForm;


