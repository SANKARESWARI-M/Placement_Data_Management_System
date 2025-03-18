import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; 
import HomePage from "./component/Home";
import AdminRecruiters from "./component/AdminRecruiters";
import Drive from "./component/Drive";
import UpdateShortlist from "./component/Shortlist";
import StudentRecruiters from "./component/StudentRecruiters";
import Zoho from "./component/company/Zoho";
import CompanyPage from "./component/company/CompanyDetails";  // Ensure this is correctly imported
import CompanyDetails from "./component/company/CompanyDetails";

const App = () => {
    return (
        <Router>
            <div>
                <h1>Recruitment Management System</h1>
                <nav className="navbar">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/recruiters">Recruiters</a></li>
            <li><a href="/drive">Drive</a></li>
          </ul>
        </nav>
                <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recruiters" element={<AdminRecruiters />} />
          <Route path="/drive" element={<Drive />} /> {/* Add Drive component if needed */}
          <Route path="/company/:companyName" element={<CompanyDetails />} />
        </Routes>

                {/* <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/admin" element={<AdminRecruiters />} />
                    <Route path="/students" element={<StudentRecruiters />} />
                    <Route path="/drive" element={<PostDrive />} />
                    <Route path="/shortlist" element={<UpdateShortlist />} />
                    
                   
                    <Route path="/company/zoho" element={<Zoho />} />

                    
                    <Route path="/company/:companyName" element={<CompanyPage />} />
                </Routes> */}
                {/* <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/company/:id" element={<CompanyPage />} />
                    <Route path="/admin" element={<AdminRecruiters />} />
                </Routes> */}
               
      
            </div>
        </Router>
    );
};

export default App;
