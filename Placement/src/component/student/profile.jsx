import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./navbar";
import '../../styles/StudentProfile.css';

const StudentProfile = () => {
    const regno = localStorage.getItem("username");

    const [formData, setFormData] = useState({
        regno: regno || "",
        name: "", batch: "", degree: "", dept: "",
        gender: "", dob: "", hsc_percentage: "", sslc_percentage: "",
        sslcSchoolName: "", sslcBoard: "", sslcYear: "",
        hscSchoolName: "", hscBoard: "", hscYear: "", hsccutoff: "",
        sem1_cgpa: "", sem2_cgpa: "", sem3_cgpa: "", sem4_cgpa: "",
        sem5_cgpa: "", sem6_cgpa: "", sem7_cgpa: "", sem8_cgpa: "",
        cgpaOverall: "", history_of_arrear: "No", standing_arrear: "No",
        address: "", student_mobile: "", secondary_mobile: "",
        college_email: "", personal_email: "", aadhar_number: "",
        pancard_number: "", passport: "No", placementWilling: "Yes"
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false); // Controls form visibility
    const [studentData, setStudentData] = useState(null); // Store fetched student data

    // 🔹 Fetch Student Profile Data on Component Mount (Using `regno` from `localStorage`)
    useEffect(() => {
        const fetchStudentData = async () => {
            if (!regno) return;

            try {
                const response = await axios.get(`http://localhost:5000/api/student-profile/${regno}`);
                setStudentData(response.data); // Store fetched data
                setFormData(response.data); // Set form data to fetched data
                setShowForm(false); // Don't show form if profile exists
            } catch (error) {
                setShowForm(true); // Show form if no profile is found
            }
        };

        fetchStudentData();
    }, [regno]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const phoneRegex = /^[6-9]\d{9}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const aadharRegex = /^\d{12}$/;
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

        if (!phoneRegex.test(formData.student_mobile)) {
            alert("Invalid Student Mobile Number");
            return false;
        }
        if (formData.secondary_mobile && !phoneRegex.test(formData.secondary_mobile)) {
            alert("Invalid Secondary Mobile Number");
            return false;
        }
        if (!emailRegex.test(formData.college_email) || !emailRegex.test(formData.personal_email)) {
            alert("Invalid Email Format");
            return false;
        }
        if (!aadharRegex.test(formData.aadhar_number)) {
            alert("Invalid Aadhar Number (12 digits required)");
            return false;
        }
        if (!panRegex.test(formData.pancard_number)) {
            alert("Invalid PAN Card Number");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const method = studentData ? "put" : "post";
            const endpoint = studentData
                ? `http://localhost:5000/api/student-profile/${regno}`
                : "http://localhost:5000/api/student-profile";

            const response = await axios[method](endpoint, formData);
            alert(response.data.message);

            setShowForm(false); // Hide form after submission
            setStudentData(formData); // Update student data with the form data

        } catch (error) {
            alert("Error submitting form: " + error.message);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setShowForm(true); // Show form when edit is clicked
    };

    return (
        <>
            <Navbar />
            <div className="profile-container">
                <h2>Student Profile</h2>

                {/* Create/Edit Profile Button */}
                {!showForm && !studentData && (
                    <button onClick={() => setShowForm(true)} className="create-profile-btn">
                        Create Profile
                    </button>
                )}

                {/* Profile Form - Visible only when showForm is true */}
                {showForm && (
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="regno" placeholder="Register Number" value={formData.regno} onChange={handleChange} required />

                        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                        <input type="text" name="batch" placeholder="Batch" value={formData.batch} onChange={handleChange} required />
                        <input type="text" name="degree" placeholder="Degree" value={formData.degree} onChange={handleChange} required />
                        <input type="text" name="dept" placeholder="Department" value={formData.dept} onChange={handleChange} required />
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />

                        <input type="text" name="sslcSchoolName" placeholder="SSLC School Name" value={formData.sslcSchoolName} onChange={handleChange} required />
                        <input type="text" name="sslcBoard" placeholder="SSLC Board" value={formData.sslcBoard} onChange={handleChange} required />
                        <input type="number" name="sslcYear" placeholder="SSLC Year" value={formData.sslcYear} onChange={handleChange} required />
                        <input type="text" name="hscSchoolName" placeholder="HSC School Name" value={formData.hscSchoolName} onChange={handleChange} required />
                        <input type="text" name="hscBoard" placeholder="HSC Board" value={formData.hscBoard} onChange={handleChange} required />
                        <input type="number" name="hscYear" placeholder="HSC Year" value={formData.hscYear} onChange={handleChange} required />
                        <input type="number" name="hsccutoff" placeholder="HSC Cutoff" value={formData.hsccutoff} onChange={handleChange} required />

                        <input type="number" step="0.01" name="sem1_cgpa" placeholder="Sem 1 CGPA" value={formData.sem1_cgpa} onChange={handleChange} />
                        <input type="number" step="0.01" name="sem2_cgpa" placeholder="Sem 2 CGPA" value={formData.sem2_cgpa} onChange={handleChange} />
                        <input type="number" step="0.01" name="sem3_cgpa" placeholder="Sem 3 CGPA" value={formData.sem3_cgpa} onChange={handleChange} />
                        <input type="number" step="0.01" name="sem4_cgpa" placeholder="Sem 4 CGPA" value={formData.sem4_cgpa} onChange={handleChange} />
                        <input type="number" step="0.01" name="sem5_cgpa" placeholder="Sem 5 CGPA" value={formData.sem5_cgpa} onChange={handleChange} />
                        <input type="number" step="0.01" name="sem6_cgpa" placeholder="Sem 6 CGPA" value={formData.sem6_cgpa} onChange={handleChange} />
                        <input type="number" step="0.01" name="sem7_cgpa" placeholder="Sem 7 CGPA" value={formData.sem7_cgpa} onChange={handleChange} />
                        <input type="number" step="0.01" name="sem8_cgpa" placeholder="Sem 8 CGPA" value={formData.sem8_cgpa} onChange={handleChange} />
                        <input type="number" step="0.01" name="cgpaOverall" placeholder="CGPA Overall" value={formData.cgpaOverall} onChange={handleChange} />

                        <label>History of Arrears:</label>
                        <select name="history_of_arrear" value={formData.history_of_arrear} onChange={handleChange}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>

                        <label>Standing Arrear:</label>
                        <select name="standing_arrear" value={formData.standing_arrear} onChange={handleChange}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>

                        <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} required></textarea>
                        <input type="text" name="student_mobile" placeholder="Student Mobile" value={formData.student_mobile} onChange={handleChange} required />
                        <input type="text" name="secondary_mobile" placeholder="Secondary Mobile" value={formData.secondary_mobile} onChange={handleChange} />
                        <input type="text" name="college_email" placeholder="College Email" value={formData.college_email} onChange={handleChange} required />
                        <input type="text" name="personal_email" placeholder="Personal Email" value={formData.personal_email} onChange={handleChange} />
                        <input type="text" name="aadhar_number" placeholder="Aadhar Number" value={formData.aadhar_number} onChange={handleChange} required />
                        <input type="text" name="pancard_number" placeholder="PAN Card Number" value={formData.pancard_number} onChange={handleChange} required />
                        <input type="text" name="passport" placeholder="Passport (Yes/No)" value={formData.passport} onChange={handleChange} />
                        <select name="placementWilling" value={formData.placementWilling} onChange={handleChange} required>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>

                        <button type="submit">Save Profile</button>
                    </form>
                )}

                {/* Edit Button */}
                {!showForm && studentData && (
                    <button onClick={handleEditClick} className="edit-profile-btn">Edit Profile</button>
                )}
            </div>
        </>
    );
};

export default StudentProfile;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Navbar from "./navbar";
// import '../../styles/StudentProfile.css';

// const StudentProfile = () => {
//     const regno = localStorage.getItem("username");

//   const [formData, setFormData] = useState({
//     regno: regno || "",
//     name: "", batch: "",
//     hsc_percentage: "", sslc_percentage: "",
//     sem1_cgpa: "", sem2_cgpa: "", sem3_cgpa: "", sem4_cgpa: "",
//     sem5_cgpa: "", sem6_cgpa: "", sem7_cgpa: "", sem8_cgpa: "",
//     history_of_arrear: "No", standing_arrear: "No",
//     address: "", student_mobile: "", secondary_mobile: "",
//     college_email: "", personal_email: "", aadhar_number: "",
//     pancard_number: "", passport: "No"
//   });

//   const [isEditing, setIsEditing] = useState(false);
//   const [isNewUser, setIsNewUser] = useState(true); // <--- NEW

//   // Fetch profile if exists
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/api/student-profile/${regno}`);
//         if (response.data) {
//           setFormData(response.data);
//           setIsNewUser(false);  // Profile exists
//           setIsEditing(false);  // Start in view mode
//         }
//       } catch (error) {
//         console.log("No existing profile, user can create one.");
//         setIsNewUser(true);  // No profile found
//         setIsEditing(true);  // Allow editing for new users
//       }
//     };

//     if (regno) fetchProfile();
//   }, [regno]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const validateForm = () => {
//     const phoneRegex = /^[6-9]\d{9}$/;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const aadharRegex = /^\d{12}$/;
//     const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

//     if (!phoneRegex.test(formData.student_mobile)) return alert("Invalid Student Mobile Number");
//     if (formData.secondary_mobile && !phoneRegex.test(formData.secondary_mobile)) return alert("Invalid Secondary Mobile Number");
//     if (!emailRegex.test(formData.college_email) || !emailRegex.test(formData.personal_email)) return alert("Invalid Email");
//     if (!aadharRegex.test(formData.aadhar_number)) return alert("Invalid Aadhar Number");
//     if (!panRegex.test(formData.pancard_number)) return alert("Invalid PAN Number");

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       const endpoint = isNewUser
//         ? "http://localhost:5000/api/student-profile"
//         : `http://localhost:5000/api/student-profile/${regno}`;

//       const method = isNewUser ? "post" : "put";

//       const response = await axios[method](endpoint, formData);
//       console.log("Form submitted", formData);
//       alert(response.data.message);

//       setIsEditing(false);
//       setIsNewUser(false); // Once saved, it's no longer a new user

//     } catch (error) {
//       console.error("Error submitting form:", error);
//       alert("Something went wrong!");
//     }
//   };

//   const handleEditClick = () => {
//     console.log("Edit button clicked");
//     setIsEditing(true);
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="profile-container">
//         <h2>Student Profile</h2>
//         <form onSubmit={handleSubmit}>
//           <input type="text" name="regno" value={formData.regno} disabled />

//           <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} disabled={isEditing} />
//           <input type="text" name="batch" placeholder="Batch" value={formData.batch} onChange={handleChange} disabled={isEditing} />

//           <input type="number" step="0.01" name="hsc_percentage" placeholder="HSC %" value={formData.hsc_percentage} onChange={handleChange} disabled={isEditing} />
//           <input type="number" step="0.01" name="sslc_percentage" placeholder="SSLC %" value={formData.sslc_percentage} onChange={handleChange} disabled={isEditing} />

//           {[1,2,3,4,5,6,7,8].map(i => (
//             <input key={i} type="number" step="0.01" name={`sem${i}_cgpa`} placeholder={`Sem ${i} CGPA`} value={formData[`sem${i}_cgpa`]} onChange={handleChange} disabled={isEditing} />
//           ))}

//           <label>History of Arrears:</label>
//           <select name="history_of_arrear" value={formData.history_of_arrear} onChange={handleChange} disabled={isEditing}>
//             <option value="No">No</option>
//             <option value="Yes">Yes</option>
//           </select>

//           <label>Standing Arrears:</label>
//           <select name="standing_arrear" value={formData.standing_arrear} onChange={handleChange} disabled={isEditing}>
//             <option value="No">No</option>
//             <option value="Yes">Yes</option>
//           </select>

//           <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} disabled={isEditing} />

//           <input type="text" name="student_mobile" placeholder="Student Mobile" value={formData.student_mobile} onChange={handleChange} disabled={isEditing} />
//           <input type="text" name="secondary_mobile" placeholder="Secondary Mobile" value={formData.secondary_mobile} onChange={handleChange} disabled={isEditing} />
//           <input type="email" name="college_email" placeholder="College Email" value={formData.college_email} onChange={handleChange} disabled={isEditing} />
//           <input type="email" name="personal_email" placeholder="Personal Email" value={formData.personal_email} onChange={handleChange} disabled={isEditing} />
//           <input type="text" name="aadhar_number" placeholder="Aadhar Number" value={formData.aadhar_number} onChange={handleChange} disabled={isEditing} />
//           <input type="text" name="pancard_number" placeholder="PAN Number" value={formData.pancard_number} onChange={handleChange} disabled={isEditing} />

//           <label>Passport:</label>
//           <select name="passport" value={formData.passport} onChange={handleChange} disabled={isEditing}>
//             <option value="No">No</option>
//             <option value="Yes">Yes</option>
//           </select>

//           {isEditing ? (
//             <button type="submit">Save Profile</button>
//           ) : (
//             <button type="button" onClick={handleEditClick}>Edit Profile</button>
//           )}
//         </form>
//       </div>
//     </>
//     );
// };

// export default StudentProfile;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Navbar from "./navbar";
// import '../../styles/StudentProfile.css';

// const StudentProfile = () => {
//     const [showForm, setShowForm] = useState(false); // Controls form visibility
//     const [studentData, setStudentData] = useState(null); // Store fetched student data

//     const [formData, setFormData] = useState({
//         regno: "",
//         name: "",
//         batch: "",
//         degree:"",
//         dept:"",
//         gender:"",
//         dob:"",
//         hsc_percentage: "",
//         sslc_percentage: "",
//         sslcSchoolName:"",
//         sslcBoard:"",
//         sslcYear:"",
//         hscSchoolName: "",
//         hscBoard: "",
//         hscYear: "",
//         hsccutoff: "",
//         sem1_cgpa: "",
//         sem2_cgpa: "",
//         sem3_cgpa: "",
//         sem4_cgpa: "",
//         sem5_cgpa: "",
//         sem6_cgpa: "",
//         sem7_cgpa: "",
//         sem8_cgpa: "",
//         cgpaOverall: "",
//         history_of_arrear: "No",
//         standing_arrear: "No",
//         address: "",
//         student_mobile: "",
//         secondary_mobile: "",
//         college_email: "",
//         personal_email: "",
//         aadhar_number: "",
//         pancard_number: "",
//         passport: "No",
//         placementWilling: "Yes"
//     });

//     // 🔹 Fetch Student Profile Data on Component Mount (Using `regno` from `localStorage`)
//     useEffect(() => {
//         const fetchStudentData = async () => {
//             const regno = localStorage.getItem("regno"); // Get stored regno
//             if (!regno) return; // Prevent fetching if no regno is found

//             try {
//                 const response = await axios.get(`http://localhost:5000/api/student-profile/${regno}`);
//                 setStudentData(response.data); // Store fetched data
//             } catch (error) {
//                 console.error("Error fetching student data:", error);
//             }
//         };

//         fetchStudentData();
//     }, []);

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const validateForm = () => {
//         const phoneRegex = /^[6-9]\d{9}$/;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         const aadharRegex = /^\d{12}$/;
//         const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

//         if (!phoneRegex.test(formData.student_mobile)) {
//             alert("Invalid Student Mobile Number");
//             return false;
//         }
//         if (formData.secondary_mobile && !phoneRegex.test(formData.secondary_mobile)) {
//             alert("Invalid Secondary Mobile Number");
//             return false;
//         }
//         if (!emailRegex.test(formData.college_email) || !emailRegex.test(formData.personal_email)) {
//             alert("Invalid Email Format");
//             return false;
//         }
//         if (!aadharRegex.test(formData.aadhar_number)) {
//             alert("Invalid Aadhar Number (12 digits required)");
//             return false;
//         }
//         if (!panRegex.test(formData.pancard_number)) {
//             alert("Invalid PAN Card Number");
//             return false;
//         }
//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) return;

//         try {
//             const response = await axios.post("http://localhost:5000/api/student-profile", formData);
//             alert(response.data.message);

//             // Fetch updated profile data after saving
//             const regno = localStorage.getItem("regno");
//             const updatedData = await axios.get(`http://localhost:5000/api/student-profile/${regno}`);
//             setStudentData(updatedData.data);
            
//             setShowForm(false); // Hide form after submission
//         } catch (error) {
//             alert(error.response?.data?.message || "Error submitting form");
//         }
//     };

//     return (
//         <>
//         <Navbar/>
//           <div className="profile-container">
//             <h2>Student Profile</h2>

//             {/* Create Profile Button */}
//             {!showForm && (
//                 <button onClick={() => setShowForm(true)} className="create-profile-btn">
//                     Create Profile
//                 </button>
//             )}

//             {/* Profile Form - Visible only when showForm is true */}
//             {showForm && (
//                 <form onSubmit={handleSubmit}>
//                 <input type="text" name="regno" placeholder="Register Number" onChange={handleChange} required />
//             <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
//             <input type="text" name="batch" placeholder="Batch" onChange={handleChange} required />
//             <input type="text" name="degree" placeholder="Degree" onChange={handleChange} required />
//             <input type="text" name="dept" placeholder="Department" onChange={handleChange} required />
//             <select name="gender" onChange={handleChange} required>
//               <option value="">Select Gender</option>
//                  <option value="Male">Male</option>
//                <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//             </select>
//            <input type="date" name="dob" onChange={handleChange} required />

//             <input type="text" name="sslcSchoolName" placeholder="SSLC School Name" onChange={handleChange} required />
//             <input type="text" name="sslcBoard" placeholder="SSLC Board" onChange={handleChange} required />
//              <input type="number" name="sslcYear" placeholder="SSLC Year" onChange={handleChange} required />

//              <input type="text" name="hscSchoolName" placeholder="HSC School Name" onChange={handleChange} required />                 <input type="text" name="hscBoard" placeholder="HSC Board" onChange={handleChange} required />
//           <input type="number" name="hscYear" placeholder="HSC Year" onChange={handleChange} required />
//             <input type="number" name="hsccutoff" placeholder="HSC Cutoff" onChange={handleChange} required />

//             <input type="number" step="0.01" name="hsc_percentage" placeholder="HSC Percentage" onChange={handleChange} required />
//            <input type="number" step="0.01" name="sslc_percentage" placeholder="SSLC Percentage" onChange={handleChange} required />
            
//            <input type="number" step="0.01" name="sem1_cgpa" placeholder="1st Sem CGPA" onChange={handleChange} required />
//            <input type="number" step="0.01" name="sem2_cgpa" placeholder="2nd Sem CGPA" onChange={handleChange} required />
//            <input type="number" step="0.01" name="sem3_cgpa" placeholder="3rd Sem CGPA" onChange={handleChange} required />
//            <input type="number" step="0.01" name="sem4_cgpa" placeholder="4th Sem CGPA" onChange={handleChange} required />
//            <input type="number" step="0.01" name="sem5_cgpa" placeholder="5th Sem CGPA" onChange={handleChange} />
//            <input type="number" step="0.01" name="sem6_cgpa" placeholder="6th Sem CGPA" onChange={handleChange} />
//            <input type="number" step="0.01" name="sem7_cgpa" placeholder="7th Sem CGPA" onChange={handleChange} />
//              <input type="number" step="0.01" name="sem8_cgpa" placeholder="8th Sem CGPA" onChange={handleChange} />
//             <input type="number" step="0.01" name="cgpaOverall" placeholder="Overall CGPA" onChange={handleChange} />

//             <label>History of Arrears:</label>
//             <select name="history_of_arrear" onChange={handleChange}>
//                 <option value="No">No</option>
//               <option value="Yes">Yes</option>
//            </select>
//              <label>Standing Arrears:</label>
//            <select name="standing_arrear" onChange={handleChange}>
//                 <option value="No">No</option>
//                 <option value="Yes">Yes</option>
//            </select>

//            <textarea name="address" placeholder="Address" onChange={handleChange} required />

//          <input type="text" name="student_mobile" placeholder="Student Mobile" onChange={handleChange} required />
//           <input type="text" name="secondary_mobile" placeholder="Secondary Mobile" onChange={handleChange} />

//           <input type="email" name="college_email" placeholder="College Email" onChange={handleChange} required />
//             <input type="email" name="personal_email" placeholder="Personal Email" onChange={handleChange} required />

//             <input type="text" name="aadhar_number" placeholder="Aadhar Number" onChange={handleChange} required />
// <input type="text" name="pancard_number" placeholder="PAN Card Number" onChange={handleChange} required />

//             <label>Passport Available:</label>
//             <select name="passport" onChange={handleChange}>
//                 <option value="No">No</option>
//                 <option value="Yes">Yes</option>
//              </select>

//            <label>Placement Willing:</label>
//          <select name="placementWilling" onChange={handleChange}>
//              <option value="Yes">Yes</option>                    <option value="No">No</option>
//             </select>

//             <button type="submit">Save Profile</button>
//             </form>
//             )}

//             {/* 🔹 Display the fetched Student Profile Data */}
//             {studentData && (
//                 <div className="profile-details">
//                     <h3>Saved Profile Details</h3>
//                     <p><strong>Register Number:</strong> {studentData.regno}</p>
//                     <p><strong>Name:</strong> {studentData.name}</p>
//                     <p><strong>Batch:</strong> {studentData.batch}</p>
//                     <p><strong>Degree:</strong> {studentData.degree}</p>
//                     <p><strong>Department:</strong> {studentData.dept}</p>
//                     <p><strong>Gender:</strong> {studentData.gender}</p>
//                     <p><strong>DOB:</strong> {studentData.dob}</p>
//                     <p><strong>College Email:</strong> {studentData.college_email}</p>
//                     <p><strong>Personal Email:</strong> {studentData.personal_email}</p>
//                     <p><strong>Student Mobile:</strong> {studentData.student_mobile}</p>
//                     <p><strong>Secondary Mobile:</strong> {studentData.secondary_mobile || "N/A"}</p>
//                 </div>
//             )}
//         </div>
//         </>
//     );
// };

// export default StudentProfile;




// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Navbar from "./navbar";
// import '../../styles/StudentProfile.css';

// const StudentProfile = () => {
//     const [showForm, setShowForm] = useState(false); // Controls form visibility
//     const [studentData, setStudentData] = useState(null); // Store fetched student data

//     const [formData, setFormData] = useState({
//         regno: "",
//         name: "",
//         batch: "",
//         degree:"",
//         dept:"",
//         gender:"",
//         dob:"",
//         hsc_percentage: "",
//         sslc_percentage: "",
//         sslcSchoolName:"",
//         sslcBoard:"",
//         sslcYear:"",
//         hscSchoolName: "",
//         hscBoard: "",
//         hscYear: "",
//         hsccutoff: "",
//         sem1_cgpa: "",
//         sem2_cgpa: "",
//         sem3_cgpa: "",
//         sem4_cgpa: "",
//         sem5_cgpa: "",
//         sem6_cgpa: "",
//         sem7_cgpa: "",
//         sem8_cgpa: "",
//         cgpaOverall: "",
//         history_of_arrear: "No",
//         standing_arrear: "No",
//         address: "",
//         student_mobile: "",
//         secondary_mobile: "",
//         college_email: "",
//         personal_email: "",
//         aadhar_number: "",
//         pancard_number: "",
//         passport: "No",
//         placementWilling: "Yes"
//     });

//     // 🔹 Fetch student profile data on component mount
//     useEffect(() => {
//         const fetchStudentData = async () => {
//             try {
//                 const response = await axios.get("http://localhost:5000/api/student-profile"); // Replace with correct API
//                 setStudentData(response.data); // Store fetched data
//             } catch (error) {
//                 console.error("Error fetching student data:", error);
//             }
//         };
//         fetchStudentData();
//     }, []);

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const validateForm = () => {
//         const phoneRegex = /^[6-9]\d{9}$/;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         const aadharRegex = /^\d{12}$/;
//         const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

//         if (!phoneRegex.test(formData.student_mobile)) {
//             alert("Invalid Student Mobile Number");
//             return false;
//         }
//         if (formData.secondary_mobile && !phoneRegex.test(formData.secondary_mobile)) {
//             alert("Invalid Secondary Mobile Number");
//             return false;
//         }
//         if (!emailRegex.test(formData.college_email) || !emailRegex.test(formData.personal_email)) {
//             alert("Invalid Email Format");
//             return false;
//         }
//         if (!aadharRegex.test(formData.aadhar_number)) {
//             alert("Invalid Aadhar Number (12 digits required)");
//             return false;
//         }
//         if (!panRegex.test(formData.pancard_number)) {
//             alert("Invalid PAN Card Number");
//             return false;
//         }
//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) return;

//         try {
//             const response = await axios.post("http://localhost:5000/api/student-profile", formData);
//             alert(response.data.message);
//             setStudentData(formData); // Update the displayed data after saving
//             setShowForm(false); // Hide form after submission
//         } catch (error) {
//             alert(error.response?.data?.message || "Error submitting form");
//         }
//     };

//     return (
//         <>
//         <Navbar/>
//           <div className="profile-container">
//             <h2>Student Profile</h2>

//             {/* Create Profile Button */}
//             {!showForm && (
//                 <button onClick={() => setShowForm(true)} className="create-profile-btn">
//                     Create Profile
//                 </button>
//             )}

//             {/* Profile Form - Visible only when showForm is true */}
//             {showForm && (
//                 <form onSubmit={handleSubmit}>
//                     <input type="text" name="regno" placeholder="Register Number" onChange={handleChange} required />
//                 <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
//                 <input type="text" name="batch" placeholder="Batch" onChange={handleChange} required />
//                 <input type="text" name="degree" placeholder="Degree" onChange={handleChange} required />
//                 <input type="text" name="dept" placeholder="Department" onChange={handleChange} required />
//                 <select name="gender" onChange={handleChange} required>
//                   <option value="">Select Gender</option>
//                      <option value="Male">Male</option>
//                    <option value="Female">Female</option>
//                     <option value="Other">Other</option>
//                 </select>
//                <input type="date" name="dob" onChange={handleChange} required />

//                 <input type="text" name="sslcSchoolName" placeholder="SSLC School Name" onChange={handleChange} required />
//                 <input type="text" name="sslcBoard" placeholder="SSLC Board" onChange={handleChange} required />
//                  <input type="number" name="sslcYear" placeholder="SSLC Year" onChange={handleChange} required />

//                  <input type="text" name="hscSchoolName" placeholder="HSC School Name" onChange={handleChange} required />                 <input type="text" name="hscBoard" placeholder="HSC Board" onChange={handleChange} required />
//               <input type="number" name="hscYear" placeholder="HSC Year" onChange={handleChange} required />
//                 <input type="number" name="hsccutoff" placeholder="HSC Cutoff" onChange={handleChange} required />

//                 <input type="number" step="0.01" name="hsc_percentage" placeholder="HSC Percentage" onChange={handleChange} required />
//                <input type="number" step="0.01" name="sslc_percentage" placeholder="SSLC Percentage" onChange={handleChange} required />
                
//                <input type="number" step="0.01" name="sem1_cgpa" placeholder="1st Sem CGPA" onChange={handleChange} required />
//                <input type="number" step="0.01" name="sem2_cgpa" placeholder="2nd Sem CGPA" onChange={handleChange} required />
//                <input type="number" step="0.01" name="sem3_cgpa" placeholder="3rd Sem CGPA" onChange={handleChange} required />
//                <input type="number" step="0.01" name="sem4_cgpa" placeholder="4th Sem CGPA" onChange={handleChange} required />
//                <input type="number" step="0.01" name="sem5_cgpa" placeholder="5th Sem CGPA" onChange={handleChange} />
//                <input type="number" step="0.01" name="sem6_cgpa" placeholder="6th Sem CGPA" onChange={handleChange} />
//                <input type="number" step="0.01" name="sem7_cgpa" placeholder="7th Sem CGPA" onChange={handleChange} />
//                  <input type="number" step="0.01" name="sem8_cgpa" placeholder="8th Sem CGPA" onChange={handleChange} />
//                 <input type="number" step="0.01" name="cgpaOverall" placeholder="Overall CGPA" onChange={handleChange} />

//                 <label>History of Arrears:</label>
//                 <select name="history_of_arrear" onChange={handleChange}>
//                     <option value="No">No</option>
//                   <option value="Yes">Yes</option>
//                </select>
//                  <label>Standing Arrears:</label>
//                <select name="standing_arrear" onChange={handleChange}>
//                     <option value="No">No</option>
//                     <option value="Yes">Yes</option>
//                </select>

//                <textarea name="address" placeholder="Address" onChange={handleChange} required />

//              <input type="text" name="student_mobile" placeholder="Student Mobile" onChange={handleChange} required />
//               <input type="text" name="secondary_mobile" placeholder="Secondary Mobile" onChange={handleChange} />

//               <input type="email" name="college_email" placeholder="College Email" onChange={handleChange} required />
//                 <input type="email" name="personal_email" placeholder="Personal Email" onChange={handleChange} required />

//                 <input type="text" name="aadhar_number" placeholder="Aadhar Number" onChange={handleChange} required />
// <input type="text" name="pancard_number" placeholder="PAN Card Number" onChange={handleChange} required />

//                 <label>Passport Available:</label>
//                 <select name="passport" onChange={handleChange}>
//                     <option value="No">No</option>
//                     <option value="Yes">Yes</option>
//                  </select>

//                <label>Placement Willing:</label>
//              <select name="placementWilling" onChange={handleChange}>
//                  <option value="Yes">Yes</option>                    <option value="No">No</option>
//                 </select>

//                 <button type="submit">Save Profile</button>
//                 </form>
//             )}

//             {/* 🔹 Display the fetched Student Profile Data */}
//             {studentData && (
//                 <div className="profile-details">
//                     <h3>Saved Profile Details</h3>
//                     <p><strong>Register Number:</strong> {studentData.regno}</p>
//                     <p><strong>Name:</strong> {studentData.name}</p>
//                     <p><strong>Batch:</strong> {studentData.batch}</p>
//                     <p><strong>Degree:</strong> {studentData.degree}</p>
//                     <p><strong>Department:</strong> {studentData.dept}</p>
//                     <p><strong>Gender:</strong> {studentData.gender}</p>
//                     <p><strong>DOB:</strong> {studentData.dob}</p>
//                     <p><strong>College Email:</strong> {studentData.college_email}</p>
//                     <p><strong>Personal Email:</strong> {studentData.personal_email}</p>
//                     <p><strong>Student Mobile:</strong> {studentData.student_mobile}</p>
//                     <p><strong>Secondary Mobile:</strong> {studentData.secondary_mobile || "N/A"}</p>
//                 </div>
//             )}
//         </div>
//         </>
//     );
// };

// export default StudentProfile;





// import React, { useState } from "react";
// import axios from "axios";
// import Navbar from "./navbar";
// import '../../styles/StudentProfile.css';

// const StudentProfile = () => {
//     const [showForm, setShowForm] = useState(false); // Controls form visibility
//     const [formData, setFormData] = useState({
//         regno: "",
//         name: "",
//         batch: "",
//         degree:"",
//         dept:"",
//         gender:"",
//         dob:"",
//         hsc_percentage: "",
//         sslc_percentage: "",
//         sslcSchoolName:"",
//         sslcBoard:"",
//         sslcYear:"",
//         hscSchoolName: "",
//         hscBoard: "",
//         hscYear: "",
//         hsccutoff: "",
//         sem1_cgpa: "",
//         sem2_cgpa: "",
//         sem3_cgpa: "",
//         sem4_cgpa: "",
//         sem5_cgpa: "",
//         sem6_cgpa: "",
//         sem7_cgpa: "",
//         sem8_cgpa: "",
//         cgpaOverall: "",
//         history_of_arrear: "No",
//         standing_arrear: "No",
//         address: "",
//         student_mobile: "",
//         secondary_mobile: "",
//         college_email: "",
//         personal_email: "",
//         aadhar_number: "",
//         pancard_number: "",
//         passport: "No",
//         placementWilling: "Yes"
//     });

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const validateForm = () => {
//         const phoneRegex = /^[6-9]\d{9}$/;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         const aadharRegex = /^\d{12}$/;
//         const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

//         if (!phoneRegex.test(formData.student_mobile)) {
//             alert("Invalid Student Mobile Number");
//             return false;
//         }
//         if (formData.secondary_mobile && !phoneRegex.test(formData.secondary_mobile)) {
//             alert("Invalid Secondary Mobile Number");
//             return false;
//         }
//         if (!emailRegex.test(formData.college_email) || !emailRegex.test(formData.personal_email)) {
//             alert("Invalid Email Format");
//             return false;
//         }
//         if (!aadharRegex.test(formData.aadhar_number)) {
//             alert("Invalid Aadhar Number (12 digits required)");
//             return false;
//         }
//         if (!panRegex.test(formData.pancard_number)) {
//             alert("Invalid PAN Card Number");
//             return false;
//         }
//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) return;

//         try {
//             const response = await axios.post("http://localhost:5000/api/student-profile", formData);
//             alert(response.data.message);
//         } catch (error) {
//             alert(error.response?.data?.message || "Error submitting form");
//         }
//     };

//     return (
//         <>
//         <Navbar/>
//           <div className="profile-container">
//             <h2>Student Profile</h2>
//             {/* Create Profile Button */}
//             {!showForm && (
//                     <button onClick={() => setShowForm(true)} className="create-profile-btn">
//                         Create Profile
//                     </button>
//                 )}

//             {/* Profile Form - Visible only when showForm is true */}
//             {showForm && (
//             <form onSubmit={handleSubmit}>
//             <input type="text" name="regno" placeholder="Register Number" onChange={handleChange} required />
//                 <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
//                 <input type="text" name="batch" placeholder="Batch" onChange={handleChange} required />
//                 <input type="text" name="degree" placeholder="Degree" onChange={handleChange} required />
//                 <input type="text" name="dept" placeholder="Department" onChange={handleChange} required />
//                 <select name="gender" onChange={handleChange} required>
//                     <option value="">Select Gender</option>
//                     <option value="Male">Male</option>
//                     <option value="Female">Female</option>
//                     <option value="Other">Other</option>
//                 </select>
//                 <input type="date" name="dob" onChange={handleChange} required />

//                 <input type="text" name="sslcSchoolName" placeholder="SSLC School Name" onChange={handleChange} required />
//                 <input type="text" name="sslcBoard" placeholder="SSLC Board" onChange={handleChange} required />
//                 <input type="number" name="sslcYear" placeholder="SSLC Year" onChange={handleChange} required />

//                 <input type="text" name="hscSchoolName" placeholder="HSC School Name" onChange={handleChange} required />
//                 <input type="text" name="hscBoard" placeholder="HSC Board" onChange={handleChange} required />
//                 <input type="number" name="hscYear" placeholder="HSC Year" onChange={handleChange} required />
//                 <input type="number" name="hsccutoff" placeholder="HSC Cutoff" onChange={handleChange} required />

//                 <input type="number" step="0.01" name="hsc_percentage" placeholder="HSC Percentage" onChange={handleChange} required />
//                 <input type="number" step="0.01" name="sslc_percentage" placeholder="SSLC Percentage" onChange={handleChange} required />
                
//                 <input type="number" step="0.01" name="sem1_cgpa" placeholder="1st Sem CGPA" onChange={handleChange} required />
//                 <input type="number" step="0.01" name="sem2_cgpa" placeholder="2nd Sem CGPA" onChange={handleChange} required />
//                 <input type="number" step="0.01" name="sem3_cgpa" placeholder="3rd Sem CGPA" onChange={handleChange} required />
//                 <input type="number" step="0.01" name="sem4_cgpa" placeholder="4th Sem CGPA" onChange={handleChange} required />
//                 <input type="number" step="0.01" name="sem5_cgpa" placeholder="5th Sem CGPA" onChange={handleChange} />
//                 <input type="number" step="0.01" name="sem6_cgpa" placeholder="6th Sem CGPA" onChange={handleChange} />
//                 <input type="number" step="0.01" name="sem7_cgpa" placeholder="7th Sem CGPA" onChange={handleChange} />
//                 <input type="number" step="0.01" name="sem8_cgpa" placeholder="8th Sem CGPA" onChange={handleChange} />
//                 <input type="number" step="0.01" name="cgpaOverall" placeholder="Overall CGPA" onChange={handleChange} />

//                 <label>History of Arrears:</label>
//                 <select name="history_of_arrear" onChange={handleChange}>
//                     <option value="No">No</option>
//                     <option value="Yes">Yes</option>
//                 </select>

//                 <label>Standing Arrears:</label>
//                 <select name="standing_arrear" onChange={handleChange}>
//                     <option value="No">No</option>
//                     <option value="Yes">Yes</option>
//                 </select>

//                 <textarea name="address" placeholder="Address" onChange={handleChange} required />

//                 <input type="text" name="student_mobile" placeholder="Student Mobile" onChange={handleChange} required />
//                 <input type="text" name="secondary_mobile" placeholder="Secondary Mobile" onChange={handleChange} />

//                 <input type="email" name="college_email" placeholder="College Email" onChange={handleChange} required />
//                 <input type="email" name="personal_email" placeholder="Personal Email" onChange={handleChange} required />

//                 <input type="text" name="aadhar_number" placeholder="Aadhar Number" onChange={handleChange} required />
//                 <input type="text" name="pancard_number" placeholder="PAN Card Number" onChange={handleChange} required />

//                 <label>Passport Available:</label>
//                 <select name="passport" onChange={handleChange}>
//                     <option value="No">No</option>
//                     <option value="Yes">Yes</option>
//                 </select>

//                 <label>Placement Willing:</label>
//                 <select name="placementWilling" onChange={handleChange}>
//                     <option value="Yes">Yes</option>
//                     <option value="No">No</option>
//                 </select>

//                 <button type="submit">Save Profile</button>
//             </form>
//             )}
//         </div>
//         </>
//     );
// };

// export default StudentProfile;

