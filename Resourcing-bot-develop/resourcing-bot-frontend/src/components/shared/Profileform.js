


import React, { useState ,useEffect} from 'react';
import { Typography, TextField, Button, InputAdornment, IconButton,DialogTitle,DialogContent,DialogActions,Dialog ,Snackbar } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MuiAlert from '@material-ui/lab/Alert';

const ProfileForm = ({ userData }) => {
    // Destructure userData properties
    const { name: initialName, phone: initialPhone, email: initialEmail } = userData;
  
    // State variables for form inputs
    const [name, setName] = useState(initialName || '');
    const [phone, setPhone] = useState(initialPhone || '');
    const [emailInput, setEmailInput] = useState(initialEmail || '');

    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [openErrorDialog, setOpenErrorDialog] = useState(false);

    const updateProfileApiUrl = process.env.REACT_APP__UPDATE_PROFILE_API;
    const changePasswordApiUrl = process.env.REACT_APP__CHANGE_PASSWORD_API;

  
    useEffect(() => {
       
    }, []);

   

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
    
        try {
                const response = await fetch(updateProfileApiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailInput,
                    name,
                    phone,
                }),
            });
    
            if (response.ok) {
                // Handle success
                setSuccessMessage('Profile updated successfully.');
            } else {
                // Handle errors
                console.error('Profile update failed.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };
    
const handleSubmitPassword = async (e) => {
    e.preventDefault();
    console.log('Email Input:', emailInput);
           // Basic validation
           if (!oldPassword || !newPassword || !confirmPassword) {
            setErrorMessage('Please fill in all fields.');
            setOpenErrorDialog(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('New passwords do not match.');
            setOpenErrorDialog(true);
            return;
        }
    try {
            const response = await fetch(changePasswordApiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailInput,
                oldPassword,
                newPassword,
            }),
        });

        console.log('Response status:', response.status); // Log response status

        if (response.ok) {
            const data = await response.json();
            console.log('Password change success:', data.message); // Log success message
            setSuccessMessage(data.message);
            setOpenErrorDialog(true);
        } else {
            const errorData = await response.json();
            console.log('Password change error:', errorData.message); // Log error message from API
         if (errorData.message === 'Incorrect old password.') {
            setErrorMessage(errorData.message); // Set specific error message
        } else {
            setErrorMessage('Failed to update password.'); // Generic error message
        }
        setOpenErrorDialog(true); // Open dialog to display error message
    }
    } catch (error) {
        console.error('Error changing password:', error);
        setError('Failed to update password');
    }
};

    
    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword((prevShowPassword) => !prevShowPassword);
        } else if (field === 'confirmPassword') {
            setShowConfirmPassword((prevShowConfirmPassword) => !prevShowConfirmPassword);
        }
        else if (field === 'newpassword') {
            setShowNewPassword((prevShowNewPassword) => !prevShowNewPassword);
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setPhone(value);
        } else if (name === 'name') {
            setName(value);
        } else if (name === 'emailInput') {
            setEmailInput(value);
        }
    };
    
    const handleChangePassword = (e) => {
        const { value } = e.target;
        setEmailInput(value);
    };


    const handleCloseSuccessMessage = () => {
        setSuccessMessage('');
    };
    



    const handleCloseErrorDialog = () => {
        setOpenErrorDialog(false);
    };






    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setError(null);
    };
    return (
        <div style={{ marginTop: '100px',marginLeft:'100px'}}>
            <Typography variant="h5" style={{ marginTop: '10px',color: "black", fontFamily: 'Righteous', fontSize: '40px', fontWeight: 'bold',textAlign:'initial' }}>My Profile</Typography>
    
            <form style={{ marginTop: '40px', width: '60%' }} onSubmit={handleSubmitProfile}>
                <TextField 
                    label="Name" 
                    variant="outlined" 
                    fullWidth 
                    style={{ marginBottom: '20px' }} 
                    name="name" 
                    value={name} 
                    onChange={handleChange} 
                />
                <TextField 
                    label="Phone" 
                    variant="outlined" 
                    fullWidth 
                    style={{ marginBottom: '20px' }} 
                    name="phone" 
                    value={phone} 
                    onChange={handleChange} 
                />
                <TextField 
                    // label="Email" 
                    variant="outlined" 
                    fullWidth 
                    style={{ marginBottom: '20px' }} 
                    name="emailInput" 
                    value={emailInput} 
                    onChange={handleChange} 
                />
                <Button 
                    type="submit" 
                    style={{ marginBottom: '20px', backgroundColor: 'rgba(79, 55, 139, 1)', marginLeft: '500px', borderRadius: '20px', color: 'white' }}
                >
                    Update Profile
                </Button>
            </form>
    
            {/* Change Password Section */}
            <div style={{ marginTop: '40px' }}>
                <Typography variant="h5" style={{ marginTop: '10px', color: "black", fontFamily: 'Righteous', fontSize: '40px', fontWeight: 'bold',textAlign:'initial' }}>Change Password</Typography>
                <form style={{ marginTop: '20px', width: '60%' }} onSubmit={handleSubmitPassword}>
                <TextField 
                    // label="Email" 
                    variant="outlined" 
                    fullWidth 
                    style={{ marginBottom: '20px' }} 
                    name="emailInput" 
                    value={emailInput} 
                    onChange={handleChangePassword} 
                />
                    <TextField
                        label="Old Password"
                        id="oldPassword"
                        name="oldPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
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
                        label="New Password"
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        fullWidth
                        margin="normal"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => togglePasswordVisibility('newpassword')} edge="end">
                                        {showNewPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <Button 
                        type="submit" 
                        style={{ marginBottom: '20px', backgroundColor: 'rgba(79, 55, 139, 1)', marginLeft: '500px', borderRadius: '20px', color: 'white' }}
                    >
                        Update Password
                    </Button>
                </form>
            </div>


            <Dialog open={openErrorDialog} onClose={handleCloseErrorDialog}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <Typography>{errorMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseErrorDialog} color="primary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!successMessage} onClose={handleCloseSuccessMessage}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>
                    <Typography>{successMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSuccessMessage} color="primary" autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Snackbar */}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <MuiAlert elevation={6} variant="filled" onClose={handleSnackbarClose} severity="error">
                    {error}
                </MuiAlert>
            </Snackbar>
        </div>
    );
};

export default ProfileForm;
