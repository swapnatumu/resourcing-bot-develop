import React from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Typography,
  IconButton
} from "@mui/material";

function AlreadyRegistered() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, backgroundColor: 'rgba(232, 222, 248, 1)', color: 'white' }}>
        <div style={{ padding: "20px" }}>
          <div style={{ flex: 1, backgroundColor: 'transparent', display: "flex", flexDirection: "column", marginTop: '300px', marginRight: '10px', color: "black" }}>
            <h1 id="blueHeading" style={{ fontSize: "3.5rem", marginBottom: "20px", marginRight: '10px' }}>Resourcing-Bot</h1>
            <p id="blueText" style={{ fontSize: "2.5rem", width: "70%" }}>Your one-stop solution for effortless hiring</p>
            <div></div>
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
        <IconButton onClick={() => navigate("/")} style={{ position: "absolute", top: "400px", left: "200px", color: "black" }}>
        <ArrowBackIcon   style={{ fontSize: "50px" }}/>
        </IconButton>
        <div style={{ padding: "20px", color: "black", width: "500px", marginTop: '100px' }}>
          <Typography style={{ color: "black" }}>
            <h1> Already Registered</h1>
          </Typography>
          <Typography style={{ color: "black" }}>
        <p> You have successfully registered with us already. </p> 
<p>You will receive an email shortly once your membership is approved.  </p>        </Typography>
        </div>
      </div>
    </div>
  );
}

export default AlreadyRegistered;
