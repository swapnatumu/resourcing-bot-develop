import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Divider from '@mui/material/Divider';
import {
  AppBar,Toolbar,Typography,
  Button,Table,
  TableHead,TableBody,
  TableRow,TableCell,
  CircularProgress,CssBaseline,
  IconButton, Box,TableFooter,Paper,Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WidgetsIcon from "@mui/icons-material/Widgets";
import BarChartIcon from "@mui/icons-material/BarChart";
import Pagination from  '../../utils/Pagination';
import { getEmailTemplate } from '../../emailTemplates/emailTemplate';
import ProfileForm from '../shared/Profileform.js';



const ContainerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 30px;
  position:'fixed';

`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 19%;
  background-color:rgba(232, 222, 248, 1) ;
  height: 100vh;
  align-items: flex-start;
  padding:50px;

`;

const MainContent = styled.div`
  width: 75%;

`;
const StyledAvatar = styled(Avatar)`
  background-color: rgba(79, 55, 139, 1);
  margin-right: 10px;
`;

export const handleApprove = async (email, index,  setLoadingMap,  approveuserApiUrl, sendemailApiUrl, fetchUsers) => {
  console.log(setLoadingMap);

  try {
    const response = await axios.post(approveuserApiUrl, { email });
    
    if (response.data.success) {     
      await sendApprovalEmail(email, sendemailApiUrl); 
      fetchUsers(response.data);    
     
    }
  } catch (error) {
    console.error('Error approving user:', error);
  } finally {
    setLoadingMap(prevLoadingMap => ({ ...prevLoadingMap, [index]: false }));
  }
}
 
export const handleReject = async (email, index, setLoadingMap,  rejectuserApiUrl, sendemailApiUrl, fetchUsers) => {
 
  try {
    const response = await axios.post(rejectuserApiUrl, { email });
    if (response.data.success) {
      await sendRejectionEmail(email, sendemailApiUrl);
      fetchUsers(response.data);               
    }
  
  } catch (error) {
    console.error('Error rejecting user:', error);
  } finally {
    setLoadingMap(prevLoadingMap => ({ ...prevLoadingMap, [index]: false }));
  }
}
 
export const sendApprovalEmail = async (email,  sendemailApiUrl) => {
  console.log("enter to aprroval")
  try {
    const loginUrl = process.env.REACT_APP_LOCAL_HOST_API;
     
    const { subject, body } = getEmailTemplate('approvalEmail');
    
    // Construct the email body with the loginUrl
    const emailBody = body.replace('${loginUrl}', loginUrl);
   
    const response = await axios.post(sendemailApiUrl, {
      candidateEmail: [email],
      subject: subject,
      body: emailBody
    });
    console.log("response:", response.data);

  } catch (error) {
    console.error('Error sending approval email:', error);
   
  }
}
 
export const sendRejectionEmail = async (email, sendemailApiUrl) => {
  console.log("enter to rejection")
  try {
    const { subject, body } = getEmailTemplate('rejectionEmail');
   
    const response = await axios.post(sendemailApiUrl, {
      candidateEmail: [email],
      subject: subject,
      body: body
    });
    console.log("response:", response.data);
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw new Error('Failed to send rejection email'); 
  }
}


function AdminDashboard() {
  const navigate = useNavigate();
  const [loadingMap, setLoadingMap] = useState({});
  const { initialPendingUsers, initialApprovedUsers , initialRejectedUsers  } = useLocation().state || {};;
  const [pendingUsers, setPendingUsers] = useState(initialPendingUsers || []);
  const [approvedUsers, setApprovedUsers] = useState(initialApprovedUsers || []);
  const [rejectedUsers, setRejectedUsers] = useState(initialRejectedUsers || []);


  const approveuserApiUrl = process.env.REACT_APP_APPROVE_USER_API;
  const sendemailApiUrl = process.env.REACT_APP_SEND_EMAIL_API || "http://127.0.0.1:3004/sendEmail";
  const rejectuserApiUrl = process.env.REACT_APP_REJECT_USER_API;
  const logoutApiUrl = process.env.REACT_APP_LOGOUT_API;

  const updateProfileApiUrl = process.env.REACT_APP_UPDATE_PROFILE_API;
  const changePasswordApiUrl = process.env.REACT_APP_CHANGE_PASSWORD_API;
  const { email, name, phone,userType } = useLocation().state || {};
  const [userData, setUserData] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false); 

  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);


  const MENU_ITEMS = {
    ADMIN_DASHBOARD: 'ADMIN_DASHBOARD',
    APPROVED_USERS: 'APPROVED_USERS',
    REJECTED_USERS: 'REJECTED_USERS',
  };

  const [activeTab, setActiveTab] = useState(MENU_ITEMS.ADMIN_DASHBOARD);


  useEffect(() => {
    if (name && phone && email && userType) {
      // Only set userData if all values are present
      setUserData({ name, phone, email,userType });
    }
  }, [name, phone, email,userType]);

 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page
  const [usersPerPage] = useState(itemsPerPage);

  // Handle pagination navigation
  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  // Determine which users array to paginate based on activeTab
  let usersToPaginate = [];
  switch (activeTab) {
    case 'dashboard':
    case 'admin_dashboard':
      usersToPaginate = pendingUsers;
      break;
    case 'approved':
      usersToPaginate = approvedUsers;
      break;
    case 'rejected':
      usersToPaginate = rejectedUsers;
      break;
    default:
      break;
  }

  // Calculate pagination data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(usersToPaginate.length / itemsPerPage);

  // Ensure currentPage does not exceed totalPages when items are deleted or changed
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  
  const fetchUsers =  (data) => {
    setPendingUsers(data.pendingUsers);
    setApprovedUsers(data.approvedUsers);
    setRejectedUsers(data.rejectedUsers);
   
};



const handleLogout = async () => {
  try {
      const token = localStorage.getItem('token');
      if (!token) {
          console.error('No token found in localStorage');
          return;
      }

      const response = await axios.post(logoutApiUrl, {}, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      console.log(response.data.message);
      localStorage.removeItem('token');
      navigate('/');
  } catch (error) {
      console.error('Error logging out:', error.response?.data.message || error.message);
  }
};
const togglePasswordVisibility = (field) => {
  if (field === 'password') {
  setShowPassword((prevShowPassword) => !prevShowPassword);
  } else if (field === 'confirmPassword') {
  setShowConfirmPassword((prevShowConfirmPassword) => !prevShowConfirmPassword);
  }else if (field === 'oldPassword') {
    setShowOldPassword((prevShowOldPassword) => !prevShowOldPassword); // Handle old password
  }
  };

  const handleCloseSuccessMessage = () => {
    setSuccessMessage('');
};

const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setError(null);
};

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'lightgray',
    width: '100%',
    height: '5%',
    borderRadius: '15px',
  },
}));

    // Calculate index range for current page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = pendingUsers.slice(indexOfFirstUser, indexOfLastUser);
  const approvedUser = approvedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const rejecteduser = rejectedUsers.slice(indexOfFirstUser, indexOfLastUser);

  

    const handleSubmitProfile = async (e) => {
      e.preventDefault();

      try {
          
            const response = await fetch(updateProfileApiUrl, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  email: email,
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

      try {
          
            const response = await fetch(changePasswordApiUrl, {
            
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  email: email,
                  oldPassword,
                  newPassword,
              }),
          });

          if (response.ok) {
              // Handle success
              setSuccessMessage('Password updated successfully.');
              
          } else {
              // Handle errors
              console.error('Password change failed.');
          }
      } catch (error) {
          console.error('Error changing password:', error);
      }
  };

return (
  <div >
    <CssBaseline />
    <AppBar position="absolute" style={{ backgroundColor: 'rgba(232, 222, 248, 1)', borderBottom: '1.5px solid black' }}>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MenuIcon sx={{ marginRight: '10px', color: 'black' }} />
          <Typography variant="h6" component="div" style={{ color: 'black', fontWeight: 'bold', fontFamily: 'Righteous', fontSize: '30px' }}>
            Resourcing Bot
          </Typography>

        </Box>

        <Paper style={{ height:'20px',padding: '25px', maxWidth: '300px',backgroundColor:'transparent',border:'1px solid rgba(79, 55, 139, 1)',borderRadius:'20px' }}>
        {userData && (
          <Box display="flex" style={{ marginTop: '-20px' }}>
            <StyledAvatar>{userData.name.charAt(0)}</StyledAvatar>
            <Box>
              <Typography variant="body1" style={{ color: 'black', fontWeight: 'bold' }}>
              {userData.name}
              </Typography>
              <Typography variant="body2" style={{ color: 'black' }}>
                {userData.userType}
                </Typography>
            </Box>
          </Box>
        )}
      </Paper>
      </Toolbar>
    </AppBar>

    <ContainerWrapper >
      <MenuContainer>
        <Typography variant="body1" sx={{ marginLeft: '0px' }}>Admin Tools</Typography><br></br>
        <CustomIconButton color="inherit"  onClick={() => setActiveTab('dashboard')} selected={activeTab === 'dashboard'} >
          <WidgetsIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Admin Dashboard</Typography>
        </CustomIconButton><br></br>
        <CustomIconButton color="inherit" onClick={() => setActiveTab('approved')} selected={activeTab === 'approved'}>
          <CheckCircleIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Approved Users</Typography>
        </CustomIconButton><br></br>
        <CustomIconButton color="inherit" onClick={() => setActiveTab('rejected')} selected={activeTab === 'rejected'}>
          <CancelIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold', borderRadius: '20px' }}>Rejected Users</Typography>
        </CustomIconButton>

        <Divider style={{ width: '100%', marginTop: '30px', borderBottomWidth: 1, backgroundColor: '#370665', height: '0.5px' }} /><br></br>

        <Typography variant="body1" sx={{ marginLeft: '0px' }}>Reporting</Typography><br></br>
        <CustomIconButton color="inherit" onClick={() => setActiveTab('report')} selected={activeTab === 'report'}>
          <BarChartIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Report</Typography>
        </CustomIconButton>
        <Divider style={{ width: '100%', marginTop: '30px', borderBottomWidth: 1, backgroundColor: '#370665', height: '0.5px' }} /><br></br>

        <Typography variant="body1" sx={{ marginLeft: '0px' }}>Account</Typography><br></br>
        <CustomIconButton color="inherit" onClick={() => setActiveTab('profile')} selected={activeTab === 'profile'}>
          <PersonIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Profile</Typography>
        </CustomIconButton><br></br>
        <IconButton color="inherit" onClick={handleLogout}>
          <ExitToAppIcon />
          <Typography variant="body1" sx={{ marginLeft: '15px', fontWeight: 'bold' }}>Logout</Typography>
        </IconButton>
      </MenuContainer>
    <MainContent>

  {/* Conditional rendering based on activeTab */}
  { activeTab === MENU_ITEMS.ADMIN_DASHBOARD || activeTab === 'dashboard' ? (

    <div>
      {/* Display Pending Users */}
      {pendingUsers.length > 0 ? (
        <div>
          <Typography variant="h5" style={{ marginTop: '100px', marginBottom: '10px', color: "black", fontFamily: 'Righteous', fontSize: '50px', fontWeight: 'bold' }}>Pending Users</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '40px', width: '25%', border: '1px solid black', borderRadius: '20px', justifyContent: 'center', backgroundColor: 'rgba(232, 222, 248, 1)' }}>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
              {pendingUsers.length}
            </Typography>
            <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)' }}>
              Users Waiting for the review
            </Typography>
          </Box>

          <Table sx={{ width: '70%', marginTop: '20px' }}>
            <TableHead>
              <TableRow sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center', backgroundColor: 'rgba(79, 55, 139, 1)' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>User Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>User Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>Current Status </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentUsers.map((user, index) => (

                <TableRow key={index}>
                  <TableCell style={{  padding: '8px', textAlign: 'center' }}>{user.email}</TableCell>
                  <TableCell style={{  padding: '8px', textAlign: 'center' }}>{user.userType}</TableCell>
                  <TableCell style={{  padding: '8px', textAlign: 'center' }}>
                    <Button style={{ textAlign: 'center',backgroundColor: 'rgba(232, 222, 248, 1)', borderRadius:'20px',color:'rgba(79, 55, 139, 1)' }}>
                      Under Review
                    </Button> 
                    </TableCell>
                  
                  <TableCell style={{ padding: '8px', textAlign: 'center' }}>
                    <Button
                      disabled={loadingMap[index]}
                      onClick={() => handleApprove(user.email, index, setLoadingMap,  approveuserApiUrl, sendemailApiUrl, fetchUsers)}
                      style={{ marginRight: '10px',textAlign: 'center',border: '1px solid rgba(79, 55, 139, 1)', borderRadius:'20px',color:'rgba(79, 55, 139, 1)' }}
                    >
                      Approve
                    </Button>
                    <Button
                      disabled={loadingMap[index]}
                      onClick={() => handleReject(user.email, index, setLoadingMap,  rejectuserApiUrl, sendemailApiUrl, fetchUsers)}
                      style={{ marginRight: '10px',textAlign: 'center',border: '1px solid rgba(79, 55, 139, 1)', borderRadius:'20px',color:'rgba(79, 55, 139, 1)'}}
                    >
                      Reject
                    </Button>
                    {loadingMap[index] && <CircularProgress size={24} style={{ marginLeft: '10px' }} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
              <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} totalPages={totalPages} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} />

              </TableRow>
            </TableFooter>
          </Table>
        </div>
      ) : (
        <Typography variant="body1" style={{ marginTop: '200px', fontFamily: 'Righteous', fontSize: '50px', fontWeight: 'bold' }}>No pending users found.</Typography>
      )}
    </div>
  ): null}

  {activeTab === 'approved' && (
    <div style={{ marginTop: '100px' }}>
      {/* Display Approved Users */}
      <Typography variant="h5" style={{ marginTop: '20px', marginBottom: '10px', color: "black", fontFamily: 'Righteous', fontSize: '50px', fontWeight: 'bold' }}>Approved Users</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '40px', width: '25%', border: '1px solid black', borderRadius: '20px', justifyContent: 'center', backgroundColor: 'rgba(232, 222, 248, 1)' }}>
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
          {approvedUsers.length}
        </Typography>
        <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)' }}>
          Already Approved users
        </Typography>
      </Box>
      <Table sx={{ width: '70%', marginTop: '20px' }}>
        <TableHead>
        <TableRow sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center', backgroundColor: 'rgba(79, 55, 139, 1)' }}>
            <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>User Email</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>User Type</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>Current Status </TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {approvedUser.map((user, index) => (
            <TableRow key={index}>
              <TableCell style={{  padding: '8px', textAlign: 'center' }}>{user.email}</TableCell>
              <TableCell style={{  padding: '8px', textAlign: 'center' }}>{user.userType}</TableCell>
              <TableCell style={{  padding: '8px', textAlign: 'center' }}>
                <Button style={{ textAlign: 'center',backgroundColor: 'rgba(232, 222, 248, 1)', borderRadius:'20px',color:'rgba(79, 55, 139, 1)' }}>
                  Approved
                </Button> 
              </TableCell>
                  
              <TableCell style={{ padding: '8px', textAlign: 'center' }}>
                <Button
                  disabled={loadingMap[index]}
                  onClick={() => handleReject(user.email, index, setLoadingMap, rejectuserApiUrl, sendemailApiUrl, fetchUsers)}
                  style={{ marginRight: '10px',textAlign: 'center',border: '1px solid rgba(79, 55, 139, 1)', borderRadius:'20px',color:'rgba(79, 55, 139, 1)' }}
                >
                  Reject
                </Button>
                {loadingMap[index] && <CircularProgress size={24} style={{ marginLeft: '10px' }} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
          <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} totalPages={totalPages} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} />

    
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )}

  {activeTab === 'rejected' && (
    <div style={{ marginTop: '100px' }}>
      <Typography variant="h5" style={{ marginTop: '20px', marginBottom: '10px', color: "black", fontFamily: 'Righteous', fontSize: '50px', fontWeight: 'bold' }}>Rejected Users</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '40px', width: '25%', border: '1px solid black', borderRadius: '20px', justifyContent: 'center', backgroundColor: 'rgba(232, 222, 248, 1)' }}>
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'rgba(79, 55, 139, 1)', marginRight: '10px' }}>
          {rejectedUsers.length}
        </Typography>
        <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)' }}>
          Already Rejected Users
        </Typography>
      </Box>
      <Table sx={{ width: '70%', marginTop: '20px' }}>
        <TableHead>
        <TableRow sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center', backgroundColor: 'rgba(79, 55, 139, 1)' }}>
            <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>User Email</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>User Type</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>Current Status </TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #003366', textAlign: 'center' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rejecteduser.map((user, index) => (
            <TableRow key={index}>
              <TableCell style={{  padding: '8px', textAlign: 'center' }}>{user.email}</TableCell>
              <TableCell style={{  padding: '8px', textAlign: 'center' }}>{user.userType}</TableCell>
              <TableCell style={{  padding: '8px', textAlign: 'center' }}>
                <Button style={{ textAlign: 'center',backgroundColor: 'rgba(232, 222, 248, 1)', borderRadius:'20px',color:'rgba(79, 55, 139, 1)' }}>
                  Rejected
                </Button>
              </TableCell>
              <TableCell style={{  padding: '8px', textAlign: 'center' }}>
                <Button
                  disabled={loadingMap[index]}
                  onClick={() => handleApprove(user.email, index, setLoadingMap, approveuserApiUrl, sendemailApiUrl, fetchUsers)}
                  style={{ marginRight: '10px',textAlign: 'center',border: '1px solid rgba(79, 55, 139, 1)', borderRadius:'20px',color:'rgba(79, 55, 139, 1)' }}
                >
                  Approve
                </Button>
                {loadingMap[index] && <CircularProgress size={24} style={{ marginLeft: '10px' }} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
          <Pagination itemsPerPage={itemsPerPage} currentPage={currentPage} totalPages={totalPages} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} />

    
          </TableRow>
        </TableFooter> 
      
      </Table>
    </div>
  )}
  {activeTab === 'report' && (
    <div style={{ marginTop: '40px' }}>
      {/* Display Reports */}
      <Typography variant="h5" style={{ marginTop: '20px', marginBottom: '10px', color: "black", fontFamily: 'Righteous', fontSize: '50px', fontWeight: 'bold' }}>Reports</Typography>
        <Typography variant="h6" component="div" sx={{ color: 'rgba(79, 55, 139, 1)' }}>
        Under Implementation
        </Typography>
    </div>
  )}


  {activeTab === 'profile' && (
          <>
            <ProfileForm userData={userData} />
          </>
  )}  

</MainContent>

</ContainerWrapper>

  </div>
);
}
export default AdminDashboard;

       