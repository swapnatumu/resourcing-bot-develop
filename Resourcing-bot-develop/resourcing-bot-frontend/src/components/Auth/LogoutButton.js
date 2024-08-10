import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
         navigate('/');
    };

    return (
            <Button 
                variant="contained" 
                color="primary"
                style={{ 
                    position: 'fixed', 
                    top: '2px', 
                    right: '5px',
                    color: 'white', 


                }} 
                onClick={handleLogout}
            >

                Logout
                
            </Button>
    );
};

export default LogoutButton;

