import React from "react";
import { Link } from "react-router-dom";
import '../../styles/Navbar.css';
import LogoutButton from "../Logout";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo Section */}
      <div className="navbar-logo">
        <img 
          src="https://lms.nec.edu.in/pluginfile.php/1/theme_academi/logo/1739862648/logo.jpeg" 
          alt="NEC Logo" 
          className="navbar-logo-img"
        />
        <span>National Engineering College</span>
      </div>

      {/* Navigation Links */}
      <ul className="navbar-links">
      <li><Link to="/staff-home">Home</Link></li>
      <li><Link to="/staff-recruiters">Recruiters</Link></li>  
       <li><Link to="/staff-upcomingdrive">Upcoming Drive</Link></li>
       <li><Link to="/staff-tutorward">Students details</Link></li>
       <li><Link to="/staff-hackathon">Hackathon</Link></li>
      </ul>

      {/* Right Section: Icons & Logout */}
      <div className="navbar-right">
        <div className="navbar-icons">
          <span className="material-symbols-outlined">notifications</span> 
          <Link to="/studentprofile" title="Profile">
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        </div>

        <LogoutButton className="logout-button" />
      </div>
    </nav>
  );
};

export default Navbar;

