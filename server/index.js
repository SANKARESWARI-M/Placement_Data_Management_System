import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2";
import cors from "cors";
import path from "path";
import multer from "multer";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { connect } from "http2";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and PDF files are allowed."), false);
  }
  cb(null, true);
};
const upload = multer({ storage, fileFilter });

// MySQL Connection (Use Pool for better handling)
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Ramya@123",
  database: "placement",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Check DB Connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
    connection.release();
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Ensure Indexes Exist (Workaround for IF NOT EXISTS)
const createIndexQuery = (indexName, tableName, columnName) => {
  return `CREATE INDEX ${indexName} ON ${tableName} (${columnName})`;
};

db.query(createIndexQuery("idx_companyName", "companies", "companyName"), (err) => {
  if (err && err.code !== 'ER_DUP_KEYNAME') console.error("Error creating index:", err);
});
db.query(createIndexQuery("idx_year", "placed_data", "year"), (err) => {
  if (err && err.code !== 'ER_DUP_KEYNAME') console.error("Error creating index:", err);
});


//-------------------------------------------------------------------------
///upcoming drives
// app.post("/api/upcoming-drives", upload.single('post'), (req, res) => {
//   const { company_name, eligibility, date, time, venue, role } = req.body; 
//   const salaryPackage = req.body.package; // Renamed 'package' to 'salaryPackage'

//   const postFilePath = req.file ? req.file.filename : null;

//   // Convert empty salaryPackage to NULL or a default value
//   const packageValue = salaryPackage && !isNaN(salaryPackage) ? salaryPackage : null; 

//   const query = `
//     INSERT INTO upcomingdrives (post, company_name, eligibility, date, time, venue, roles, package)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(query, [postFilePath, company_name, eligibility, date, time, venue, role, packageValue], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ message: "Database error" });
//     }
//     res.status(201).json({ message: "Upcoming drive added successfully!" });
//   });
// });

app.post("/api/upcoming-drives", upload.single('post'), (req, res) => {
  const { company_name, eligibility, date, time, venue, roles, salary } = req.body; 

  const postFilePath = req.file ? req.file.filename : null;
  
  // ✅ Ensure salary is stored as a string, not null
  const salaryValue = salary ? salary.toString().trim() : "Not specified"; 
  const rolesValue = roles && roles.trim() !== "" ? roles : "Not specified";

  console.log("Received Data:", { company_name, eligibility, date, time, venue, rolesValue, salaryValue });

  const query = `
      INSERT INTO upcomingdrives (post, company_name, eligibility, date, time, venue, roles, salary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [postFilePath, company_name, eligibility, date, time, venue, rolesValue, salaryValue], (err, result) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
      }
      res.status(201).json({ message: "Upcoming drive added successfully!" });
  });
});


// Fetch the upcoming details
app.get("/api/upcoming-drives", (req, res) => {
  const query = "SELECT * FROM upcomingdrives";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

app.get("/api/student-upcoming-drives", (req, res) => {
  const query = "SELECT * FROM upcomingdrives";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Deleting an upcoming drive post
app.delete('/api/upcoming-drives/:id', async (req, res) => {
  const { id } = req.params;

  try {
      await db.promise().query('DELETE FROM upcomingdrives WHERE id = ?', [id]);
      res.status(200).send({ message: 'Drive deleted successfully' });
  } catch (error) {
      console.error('Error deleting drive:', error);
      res.status(500).send({ message: 'Error deleting drive' });
  }
});

// New route that had the issue
app.post("/api/company-details", (req, res) => {
  const { companyName, description, ceo, location, objective } = req.body;
  const salaryPackage = req.body.package; // Renamed 'package' to 'salaryPackage'

  const query = `
    INSERT INTO companydetails (company_name, description, ceo, location, salary_package, objective)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [companyName, description, ceo, location, salaryPackage, objective], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Company details added successfully!" });
  });
});

//------------------------------------------------------------------------------



//login

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE userName = ? AND password = ?";
  db.query(query, [username, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      const userRole = result[0].role;
      return res.json({ message: "Login successful", role: userRole });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }

  });
});



// Routes
app.get("/companies", (req, res) => {
  db.query("SELECT * FROM companies", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching companies." });
    res.status(200).json({ companies: results });
  });
});



app.post("/add-company", upload.single("logo"), async (req, res) => {
  try {
      const { companyName, description, ceo, location, objective } = req.body;
      const salaryPackage = req.body.package; // Renamed 'package' to 'salaryPackage'
      let { skillSets, localBranches, roles } = req.body;

      console.log("Received Data:", req.body); // ✅ Debugging Request Data
      console.log("Uploaded File:", req.file); // ✅ Debugging File Upload

      // ✅ Fix: Parse JSON fields correctly
      try {
          skillSets = skillSets ? JSON.parse(skillSets) : [];
          localBranches = localBranches ? JSON.parse(localBranches) : [];
          roles = roles ? JSON.parse(roles) : [];
      } catch (error) {
          console.error("JSON Parsing Error:", error);
          return res.status(400).json({ message: "Invalid JSON format in skillSets, localBranches, or roles." });
      }

      // ✅ Ensure all fields are provided
      if (!companyName || !description || !ceo || !location || !salaryPackage || !objective ||
          skillSets.length === 0 || localBranches.length === 0 || roles.length === 0) {
          return res.status(400).json({ message: "All fields are required." });
      }

      // ✅ Check if a logo was uploaded
      const logo = req.file ? req.file.filename : null;

      // ✅ Log final data before inserting into MySQL
      console.log("Final Data for MySQL:", {
          companyName, description, ceo, location, salaryPackage, objective,
          skillSets, localBranches, roles, logo
      });

      // ✅ Fix: Insert into MySQL database
      const sql = `INSERT INTO companies
                   (companyName, description, ceo, location, package, objective, skillSets, localBranches, roles, logo)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await db.promise().query(sql, [
          companyName, description, ceo, location, salaryPackage, objective,
          JSON.stringify(skillSets), JSON.stringify(localBranches), JSON.stringify(roles), logo
      ]);

      res.json({ message: "Company added successfully", company: { companyName, logo } });

  } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ message: "Internal Server Error.", error: error.message });
  }
});


// update the company details
app.put('/company/:companyName', (req, res) => {
  const companyName = req.params.companyName;
  const {
    description,
    objective,
    ceo,
    location,
    skillSets,
    localBranches,
    roles,
    package: companyPackage
  } = req.body;

  const query = `
    UPDATE companies
    SET description = ?, 
        objective = ?, 
        ceo = ?, 
        location = ?, 
        skillSets = ?, 
        localBranches = ?, 
        roles = ?, 
        package = ?
    WHERE companyName = ?
  `;

  const values = [
    description,
    objective,
    ceo,
    location,
    JSON.stringify(skillSets),
    JSON.stringify(localBranches),
    JSON.stringify(roles),
    companyPackage,
    companyName
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating company:", err);
      res.status(500).json({ message: "Update failed" });
    } else {
      res.json({ message: "Company updated successfully" });
    }
  });
});


// API to delete a company by companyName
// DELETE company by companyId
app.delete("/delete-company/:companyId", (req, res) => {
  const companyId = req.params.companyId;
  const query = "DELETE FROM companies WHERE id = ?"; // assuming your column is named `id`

  db.query(query, [companyId], (err, result) => {
    if (err) {
      console.error("Error deleting company:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  });
});






// API to get total recruiters count
app.get("/api/recruiterscount", (req, res) => {
  const query = "SELECT COUNT(*) AS total FROM companies";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching recruiter count:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ total: results[0].total });
  });
});





app.post("/api/placed-students", async (req, res) => {
  try {
    const { regno, name, company_name, role, salarypackage, year } = req.body;

    // Ensure all fields are provided
    if (!regno || !name || !company_name || !role || !salarypackage || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Insert data into MySQL
    const query = `INSERT INTO placed_student (regno, name, company_name, role, package, year) VALUES (?, ?, ?, ?, ?, ?)`;
    await db.promise().query(query, [regno, name, company_name, role, salarypackage, year]);

    res.status(201).json({ message: "Placement details added successfully!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

//get total placed_student
app.get("/placed-student", (req, res) => {
  const { companyName } = req.query;
  db.query(
    "SELECT year, COUNT(*) AS student_count FROM placed_student WHERE company_name = ? GROUP BY year ORDER BY year",
    [companyName],
    (err, result) => {
      if (err) {
        console.error("Error fetching placement data:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(result);
    }
  );
});


// fetch the details for front page
app.get("/stats", (req, res) => {
  const query = `
    SELECT COUNT(*) AS total_students, AVG(package) AS avg_salary, MAX(package) AS highest_salary FROM placed_student;
  `;
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(result[0]);
    }
  });
});



app.get("/placed-student-companies", (req, res) => {
  db.query("SELECT DISTINCT company_name FROM placed_student", (err, result) => {
    if (err) {
      console.error("Error fetching companies from placed_student:", err);
      return res.status(500).json({ error: err.message });
    }

    if (!result || result.length === 0) {
      console.warn("No companies found in placed_student table.");
      return res.json([]); // ✅ Return an empty array instead of an object
    }

    console.log("Companies API Response from placed_student:", result);
    res.json(result); // ✅ Return a direct array (Correct)
  });
});

app.get("/student-details", (req, res) => {
  const { companyName, year } = req.query;
  db.query(
    "SELECT name, regno, role, package FROM placed_student WHERE company_name = ? AND year = ?",
    [companyName, year],
    (err, result) => {
      if (err) {
        console.error("Error fetching student details:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(result);
    }
  );
});




// API to get student count per year for a selected company
app.get("/students-per-year", (req, res) => {
  const company = req.query.company;
  db.query(
    "SELECT year, COUNT(*) AS student_count FROM placed_student WHERE company_name = ? GROUP BY year ORDER BY year",
    [company],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

// API to get student details for a selected year and company
app.get("/students-details", (req, res) => {
  const { company, year } = req.query;
  db.query(
    "SELECT name, regno, role, package FROM placed_student WHERE company_name = ? AND year = ?",
    [company, year],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
})

app.get("/placed-students", (req, res) => {
  db.query(
    "SELECT name, regno, company_name, role, package, year FROM placed_student",
    (err, result) => {
      if (err) {
        console.error("Error fetching placed students:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(result);
    }
  );
});

app.get("/placed-students", (req, res) => {
  const { company } = req.query;
  let sql = "SELECT name, regno, company_name, role, package, year FROM placed_student";
  const params = [];

  if (company) {
    sql += " WHERE company_name = ?";
    params.push(company);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});



//display for  student recruiters

app.get("/api/recruiters", (req, res) => {
  const query = "SELECT companyName, logo FROM companies";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching recruiters:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ recruiters: results });
  });
});


app.get("/api/upcoming-drives", (req, res) => {
  const query = "SELECT * FROM upcomingdrives";
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});
app.get("/api/student-upcoming-drives", (req, res) => {
  const query = "SELECT * FROM upcomingdrives";
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});




const formatValue = (value) => (value === "" ? null : value);

// 🔹 Save or Update Student Profile (Already Given)
app.post("/api/student-profile", (req, res) => {
  try {
    const {
      regno, name, batch, degree, dept, gender, dob, hsc_percentage, hsccutoff, hscSchoolName, hscBoard, hscYear,
      sslc_percentage, sslcYear, sslcSchoolName, sslcBoard,
      sem1_cgpa, sem2_cgpa, sem3_cgpa, sem4_cgpa, sem5_cgpa,
      sem6_cgpa, sem7_cgpa, sem8_cgpa, cgpaOverall, history_of_arrear, standing_arrear, placementWilling,
      address, student_mobile, secondary_mobile, college_email, personal_email,
      aadhar_number, pancard_number, passport
    } = req.body;

    const query = `
      INSERT INTO student_details (
        regno, name, batch,degree, dept, gender, dob, hsc_percentage,hsccutoff, hscSchoolName, hscBoard,hscYear, sslc_percentage,sslcYear, sslcSchoolName, sslcBoard, 
        sem1_cgpa, sem2_cgpa, sem3_cgpa, sem4_cgpa, sem5_cgpa, 
        sem6_cgpa, sem7_cgpa, sem8_cgpa,cgpaOverall, history_of_arrear, standing_arrear, placementWilling,
        address, student_mobile, secondary_mobile, college_email, personal_email, 
        aadhar_number, pancard_number, passport
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
      ON DUPLICATE KEY UPDATE 
        name=VALUES(name), batch=VALUES(batch), degree=VALUES(degree), dept=VALUES(dept),
        gender=VALUES(gender), dob=VALUES(dob), hsc_percentage=VALUES(hsc_percentage), 
        hsccutoff=VALUES(hsccutoff), hscSchoolName=VALUES(hscSchoolName), hscBoard=VALUES(hscBoard),hscYear=VALUES(hscYear),
        sslc_percentage=VALUES(sslc_percentage), sslcYear=VALUES(sslcYear),
        sslcSchoolName=VALUES(sslcSchoolName), sslcBoard=VALUES(sslcBoard),
        sem1_cgpa=VALUES(sem1_cgpa), sem2_cgpa=VALUES(sem2_cgpa), sem3_cgpa=VALUES(sem3_cgpa), 
        sem4_cgpa=VALUES(sem4_cgpa), sem5_cgpa=VALUES(sem5_cgpa), sem6_cgpa=VALUES(sem6_cgpa), 
        sem7_cgpa=VALUES(sem7_cgpa), sem8_cgpa=VALUES(sem8_cgpa), cgpaOverall=VALUES(cgpaOverall),
        history_of_arrear=VALUES(history_of_arrear), standing_arrear=VALUES(standing_arrear), 
        placementWilling=VALUES(placementWilling), address=VALUES(address),
        student_mobile=VALUES(student_mobile), secondary_mobile=VALUES(secondary_mobile),
        college_email=VALUES(college_email), personal_email=VALUES(personal_email),
        aadhar_number=VALUES(aadhar_number), pancard_number=VALUES(pancard_number), passport=VALUES(passport)
    `;

    const values = [
      regno, name, batch, degree, dept, gender, dob,
      hsc_percentage, hsccutoff, hscSchoolName, hscBoard, hscYear,
      sslc_percentage, sslcYear, sslcSchoolName, sslcBoard,
      formatValue(sem1_cgpa), formatValue(sem2_cgpa), formatValue(sem3_cgpa), formatValue(sem4_cgpa), formatValue(sem5_cgpa),
      formatValue(sem6_cgpa), formatValue(sem7_cgpa), formatValue(sem8_cgpa), formatValue(cgpaOverall),
      history_of_arrear, standing_arrear, placementWilling,
      address, student_mobile, secondary_mobile, college_email, personal_email,
      aadhar_number, pancard_number, passport
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error inserting/updating student profile:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Profile saved successfully!" });
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// 🔹 **Fetch Student Profile API (NEW)**
app.get("/api/student-profile/:regno", (req, res) => {
  const { regno } = req.params;

  const query = `SELECT * FROM student_details WHERE regno = ?`;

  db.query(query, [regno], (err, results) => {
    if (err) {
      console.error("Error fetching student profile:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    res.json(results[0]); // Send the student profile
  });
});











// const formatValue = (value) => (value === "" ? null : value);
// app.post("/api/student-profile", (req, res) => {
//   try {
//     const {
//       regno, name, batch, hsc_percentage, sslc_percentage,
//       sem1_cgpa, sem2_cgpa, sem3_cgpa, sem4_cgpa, sem5_cgpa,
//       sem6_cgpa, sem7_cgpa, sem8_cgpa, history_of_arrear, standing_arrear,
//       address, student_mobile, secondary_mobile, college_email, personal_email,
//       aadhar_number, pancard_number, passport
//     } = req.body;

//     const query = `
//       INSERT INTO student_details (
//         regno, name, batch, hsc_percentage, sslc_percentage, 
//         sem1_cgpa, sem2_cgpa, sem3_cgpa, sem4_cgpa, sem5_cgpa, 
//         sem6_cgpa, sem7_cgpa, sem8_cgpa, history_of_arrear, standing_arrear, 
//         address, student_mobile, secondary_mobile, college_email, personal_email, 
//         aadhar_number, pancard_number, passport
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       ON DUPLICATE KEY UPDATE 
//         name=VALUES(name), batch=VALUES(batch), hsc_percentage=VALUES(hsc_percentage),
//         sslc_percentage=VALUES(sslc_percentage), sem1_cgpa=VALUES(sem1_cgpa), sem2_cgpa=VALUES(sem2_cgpa), 
//         sem3_cgpa=VALUES(sem3_cgpa), sem4_cgpa=VALUES(sem4_cgpa), sem5_cgpa=VALUES(sem5_cgpa),
//         sem6_cgpa=VALUES(sem6_cgpa), sem7_cgpa=VALUES(sem7_cgpa), sem8_cgpa=VALUES(sem8_cgpa), 
//         history_of_arrear=VALUES(history_of_arrear), standing_arrear=VALUES(standing_arrear),
//         address=VALUES(address), student_mobile=VALUES(student_mobile), secondary_mobile=VALUES(secondary_mobile),
//         college_email=VALUES(college_email), personal_email=VALUES(personal_email),
//         aadhar_number=VALUES(aadhar_number), pancard_number=VALUES(pancard_number), passport=VALUES(passport)
//     `;

//     const values = [
//       regno, name, batch, hsc_percentage, sslc_percentage,
//       formatValue(sem1_cgpa), formatValue(sem2_cgpa), formatValue(sem3_cgpa), formatValue(sem4_cgpa), formatValue(sem5_cgpa),
//       formatValue(sem6_cgpa), formatValue(sem7_cgpa), formatValue(sem8_cgpa), history_of_arrear, standing_arrear,
//       address, student_mobile, secondary_mobile, college_email, personal_email,
//       aadhar_number, pancard_number, passport
//     ];

//     db.query(query, values, (err, result) => {
//       if (err) {
//         console.error("Error inserting/updating student profile:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       res.json({ message: "Profile saved successfully!" });
//     });

//   } catch (error) {
//     console.error("Server error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


app.post("/api/register-drive", (req, res) => {
  const { drive_id, regno, company_name, register } = req.body;

  const query = `
    INSERT INTO registered_student (id, regno, company_name, register)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE register=VALUES(register)
  `;

  db.query(query, [drive_id, regno, company_name, register], (err, result) => {
    if (err) {
      console.error("Error inserting into registered_student:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Drive registration updated successfully!" });
  });
});


app.get('/api/registered-drives/:regno', async (req, res) => {
  const { regno } = req.params;
  
  console.log(`Received request for registered drives of regno: ${regno}`); // Debugging log

  try {
    // Ensure regno is not empty
    if (!regno) {
      return res.status(400).json({ error: "Regno parameter is required" });
    }

    const sql = "SELECT company_name FROM registered_student WHERE regno = ?";
    const [results] = await db.promise().query(sql, [regno]);

    if (results.length === 0) {
      console.warn(`No registered drives found for regno: ${regno}`);
      return res.status(404).json({ error: "No registered drives found for this student" });
    }

    console.log(`Found ${results.length} drives for regno: ${regno}`); // Debugging log
    res.json(results);

  } catch (error) {
    console.error("Error fetching registered drives:", error);
    res.status(500).json({ error: "Failed to fetch registered drives" });
  }
});





//delete unselected students
app.delete("/api/delete-unselected-students", (req, res) => {
  const selectedRegnos = req.body.selectedRegnos; // Array of selected students' regnos

  if (!selectedRegnos || !Array.isArray(selectedRegnos)) {
    return res.status(400).json({ error: "Invalid request. Selected students are required." });
  }

  const sql = `DELETE FROM registered_student WHERE regno NOT IN (?)`;

  db.query(sql, [selectedRegnos], (err, result) => {
    if (err) {
      console.error("Error deleting unselected students:", err);
      return res.status(500).json({ error: "Failed to delete unselected students." });
    }

    res.json({ message: "Unselected students deleted successfully!" });
  });
});



app.get("/api/admin-registered-students", (req, res) => {
  const query = `
    SELECT rs.id, rs.regno, sd.name, rs.company_name, sd.college_email,sd.batch, 
           sd.hsc_percentage, sd.sslc_percentage, sd.sem1_cgpa AS cgpa, 
           sd.history_of_arrear, sd.standing_arrear
    FROM registered_student rs
    JOIN student_details sd ON rs.regno = sd.regno
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching registered students:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

//send mail

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: "2212052@nec.edu.in",  // Replace with your Gmail
      pass: "iiov biog vknw nznn",  // Replace with your generated App Password
  },
});

app.post("/api/send-emails", async (req, res) => {
  const { students, round } = req.body;

  if (!students || students.length === 0) {
      return res.status(400).json({ error: "No students selected" });
  }

  try {
      for (const student of students) {
          const mailOptions = {
              from: "2212052@nec.edu.in",
              to: student.college_email,
              subject: `Shortlisted for Next Round (${round})`,
              text: `Dear ${student.name},\n\nCongratulations! You have been shortlisted for the next round (${round}). Please check further details with your placement officer.\n\nBest Regards,\nPlacement Cell`,
          };

          await transporter.sendMail(mailOptions);
      }

      res.json({ message: "Emails sent successfully!" });
  } catch (error) {
      console.error("Error sending emails:", error);
      res.status(500).json({ error: "Failed to send emails" });
  }
});



//staff page
app.get("/api/students", (req, res) => {
  const { startRegNo, endRegNo } = req.query;

  let query = "SELECT * FROM student_details";
  let values = [];

  if (startRegNo && endRegNo) {
      query += " WHERE regno BETWEEN ? AND ?";
      values.push(startRegNo, endRegNo);
  }

  db.query(query, values, (err, results) => {
      if (err) {
          console.error("Error fetching student details:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(results);
  });
});


//hackathon
app.post('/api/hackathons', (req, res) => {
  const { content, link } = req.body;

  if (!content) {
      return res.status(400).json({ error: "Hackathon details cannot be empty" });
  }

  const sql = "INSERT INTO hackathons (content, link) VALUES (?, ?)";
  db.query(sql, [content, link], (err, result) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Hackathon added successfully!", id: result.insertId });
  });
});

// Endpoint to fetch hackathons
app.get('/api/hackathons', (req, res) => {
  const sql = "SELECT * FROM hackathons ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json(results);
  });
});

// Delete a hackathon
app.delete('/api/hackathons/:id', (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM hackathons WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting hackathon:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Hackathon not found" });
    }

    res.json({ message: "Hackathon deleted successfully!" });
  });
});

//import file update in placed students
app.post("/api/import-placed-students", async (req, res) => {
  try {
      const students = req.body.students;

      if (!students || students.length === 0) {
          return res.status(400).json({ error: "No students data provided" });
      }

      const query = "INSERT INTO placed_student (regno, name, company_name, role, package, year) VALUES (?, ?, ?, ?, ?, ?)";

      await Promise.all(
        students.map(async (student, index) => {
          try {
            console.log(`Processing Student ${index + 1}:, student`);
  
            // Ensure values are correctly extracted and cleaned
            const regno = student["Reg No"]?.toString().trim() || null;
            const name = student["Name"]?.trim() || null;
            const company_name = student["Company Name"]?.trim() || null;
            const role = student["role"]?.trim() || null;
            let salarypackage = parseFloat(
              student["package"]?.toString().replace(/[^\d.]/g, "")
            );
            if (isNaN(salarypackage)) salarypackage = 0.00; // Default if invalid
            const year = Number(student["year"]) || null;
  
            // Validate required fields
            if (!regno || !name || !company_name || !role || !salarypackage || !year) {
              console.warn(`⚠ Skipping student due to missing values:, student`);
              return;
            }
  
            // Insert data into placed_student table
            await db.execute(query, [regno, name, company_name, role, salarypackage, year]);
            console.log(`✅ Inserted Successfully: ${name} (${regno})`);
          } catch (error) {
            console.error(`❌ Error inserting student ${index + 1}:, error`);
          }
        })
      );
  
      // db.release(); // Release the connection back to the pool
      res.status(200).json({message: "Students imported successfully!" });
    } catch (error) {
      console.error("❌ Server Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });






// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
