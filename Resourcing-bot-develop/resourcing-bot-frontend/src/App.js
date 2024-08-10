import "./styles/App.css";
import { gapi } from 'gapi-script';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import RegistrationForm from "./components/Auth/Register";
import ResetPasswordForm from "./components/Auth/ForgotPassword";
import HiringManagerDashboard from "./components/HiringManager/HiringManagerDashboard";
import JDDetails from "./components/shared/JDDetails";
import JobDescriptionForm from "./components/HiringManager/JobDescriptionForm";
import RecruiterDashboard from "./components/Recruiter/RecruiterDashboard";
import ResumeDisplay from "./components/Recruiter/ResumeDisplay";

import InterviewerDashboard from "./components/Interviewer/InterviewerDashboard";
import SchedulingPage from './components/Recruiter/SchedulingPage';
import FeedbackForm from './components/Interviewer/FeedBackForm';
import AdminDashboard from './components/Admin/AdminDashboard';
import ArchivedJdsPage from "./components/HiringManager/ArchivedJdsPage";
import CandidateProfiles from './components/shared/CandidateProfile';
import CandidateData from "./components/shared/CandidateData";
import RegistrationSuccess from "./components/Auth/RegisterSuccess";
import AlreadyRegistered from "./components/Auth/AlreadyRegistered";
import ScreeningTestDetails from "./components/shared/ScreeningTestDetails";

// import ProtectedRoute from "./ProtectedRoute";
// import ProtectedComponent from "./components/Auth/ProtectedComponent";
function App() {

    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/registerSuccess" element={<RegistrationSuccess />} />
                    <Route path="/alreadyregistered" element={<AlreadyRegistered />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/ResetPasswordForm" element={<ResetPasswordForm />} />
                    <Route path="/hiring-dashboard" element={<HiringManagerDashboard />}/>
                    <Route path="/JDDetails" element={<JDDetails />}/>
                    <Route path="/job-description-form" element={<JobDescriptionForm />}/>
                    <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
                    <Route path="/interviewer-dashboard" element={<InterviewerDashboard />} />
                    <Route path="/resumedisplay" element={<ResumeDisplay />} />   
                    <Route path="/schedulingPage" element={<SchedulingPage />} />
                    <Route path="/feedback" element={<FeedbackForm />} />                  
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/ArchivedJdsPage" element={<ArchivedJdsPage />} />
                    <Route path="/CandidateProfiles/:jdId" element={<CandidateProfiles />} />
                    <Route path="/CandidateData/:candidateId" element={<CandidateData />} />  

                    <Route path="/screening/:screeningID" element={<ScreeningTestDetails />} />  


                    {/* <Route path="/protected" element={<ProtectedRoute><ProtectedComponent /></ProtectedRoute>} /> */}
                           
                    </Routes>
               
            </div>
        </Router>
    );
}

gapi.load("client:auth2", ()=>{
    gapi.client.init({
      clientId:'320668170244-e1pjdbp6jpbutb6vppmr32tvna8t74ak.apps.googleusercontent.com',
      Plugin_name:"chat",
    });
 
});      
 
export default App;



