import React,{useState,useEffect} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import '../../styles/Navbar.css';
import LogoutButton from "../Logout";
import LoginButton from "../Login";
const Navbar = () => {

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/notifications")
      .then(res => {
        console.log("Notifications response:", res.data);
        setNotifications(res.data);
      })
      .catch(err => {
        console.error("Error fetching notifications:", err);
      });
  }, []);

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
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/recruiters">Recruiters</Link></li>
        <li><Link to="/upcoming-drive">Upcoming Drive</Link></li>
        <li><Link to="/status">Status</Link></li>
        <li><Link to="/hackathon">Hackathon</Link></li>
      </ul>

      {/* Right Section: Icons & Logout */}
      <div className="navbar-right">
              <div className="navbar-icons">
                {/* Notifications */}
                <div 
                  className="notification-wrapper" 
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ position: "relative", cursor: "pointer" }}
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {showDropdown && (
                    <div className="notification-dropdown">
                      {notifications.length === 0 ? (
                        <p className="notification-item">No new notifications</p>
                      ) : (
                        notifications.map((notif, index) => (
                          <p key={index} className="notification-item">{notif.message}</p>
                        ))
                      )}
                    </div>
                  )}
                </div>
              
      
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


// import React from "react";
// import { Link } from "react-router-dom";
// import '../../styles/Navbar.css';
// import LogoutButton from "../Logout";

// const Navbar = () => {
//   return (
//     <nav className="navbar">
//       <div className="navbar-logo">
//         <img 
//           src="https://lms.nec.edu.in/pluginfile.php/1/theme_academi/logo/1739862648/logo.jpeg" 
//           alt="NEC Logo" 
//           className="navbar-logo-img"
//         />
//         <span>National Engineering College</span>
//       </div>
      
//       <ul className="navbar-links">
//         <li><Link to="/home">Home</Link></li>
//         <li><Link to="/recruiters">Recruiters</Link></li>
//         <li><Link to="/upcoming-drive">Upcoming Drive</Link></li>
//         <li><Link to="/status">Status</Link></li>
//       </ul>

//       {/* Icons Section */}
//       <div className="navbar-icons">
//         <span className="material-symbols-outlined">notifications</span> 
//         <Link to="/studentprofile" title="Profile">
//           <span className="material-symbols-outlined">account_circle</span>
//         </Link>
//       </div>
      
//       <LogoutButton className="logout-button" />

//     </nav>
//   );
// };

// export default Navbar;












// import React from "react";
// import { Link } from "react-router-dom";
// import '../../styles/Navbar.css';
// import LogoutButton from "../Logout";

// const Navbar = () => {
//   return (
//     <nav className="navbar">
//       <div className="navbar-logo">National Engineering College</div>
      
//       <ul className="navbar-links">
//         <li><Link to="/home">Home</Link></li>
//         <li><Link to="/recruiters">Recruiters</Link></li>
//         <li><Link to="/upcoming-drive">Upcoming Drive</Link></li>
//         <li><Link to="/status">Status</Link></li>
//       </ul>

//       <div className="navbar-icons">
//         <span>🔔</span>
//         <Link to="/studentprofile" title="Profile">👤</Link>
//       </div>
//       <LogoutButton className="logout-button" />

//     </nav>
//   );
// };

// export default Navbar;
