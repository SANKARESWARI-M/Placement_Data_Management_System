const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();
const port = 5000;

// Enable CORS for front-end access
app.use(cors());

// Set up middleware to handle JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up static folder for serving uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set destination to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set unique file name
  },
});

const upload = multer({ storage });

// Create a MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ramya@123", // Replace with your actual MySQL password
  database: "placement", // Replace with your actual MySQL database name
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }
  console.log("Connected to the database.");
});

// API endpoint to fetch company logos
app.get("/companies", async (req, res) => {
  const query = "SELECT * FROM companies"; // Assuming a 'companies' table exists
  try {
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching companies:", err);
        return res.status(500).json({ message: "Error fetching companies." });
      }
      res.status(200).json({ companies: results });
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Error fetching companies." });
  }
});

// API endpoint to add a new company
app.post("/add-company", upload.single("logo"), (req, res) => {
  const { companyName, description, ceo, location } = req.body;
  const logo = req.file ? req.file.filename : null;

  if (!companyName || !description || !ceo || !location || !logo) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const query = "INSERT INTO companies (companyName, description, ceo, location, logo) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [companyName, description, ceo, location, logo], (err, results) => {
    if (err) {
      console.error("Error adding company:", err);
      return res.status(500).json({ message: "Error adding company." });
    }
    res.status(201).json({ message: "Company added successfully.", company: req.body });
  });
});

// API endpoint to fetch specific company details (using companyName)
app.get("/companies/:companyName", (req, res) => {
  const { companyName } = req.params;
  const query = "SELECT * FROM companies WHERE companyName = ?";
  db.query(query, [companyName], (err, results) => {
    if (err) {
      console.error("Error fetching company details:", err);
      return res.status(500).json({ message: "Error fetching company details." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Company not found." });
    }
    res.status(200).json({ company: results[0] });
  });
});

// API endpoint to add placement details
app.post("/add-placement", upload.fields([{ name: 'questionBank', maxCount: 1 }, { name: 'feedbackForm', maxCount: 1 }]), (req, res) => {
  const { companyName, year, studentsPlaced } = req.body;
  const questionBank = req.files?.questionBank ? req.files.questionBank[0].filename : null;
  const feedbackForm = req.files?.feedbackForm ? req.files.feedbackForm[0].filename : null;

  // Validate that 'studentsPlaced' is a positive number
  if (isNaN(studentsPlaced) || studentsPlaced <= 0) {
    return res.status(400).json({ message: "'studentsPlaced' must be a positive number." });
  }

  if (!companyName || !year || !studentsPlaced || !questionBank || !feedbackForm) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Insert placement details into the 'placed_data' table
  const query = "INSERT INTO placed_data (companyName, year, studentsPlaced, questionBank, feedbackForm) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [companyName, year, studentsPlaced, questionBank, feedbackForm], (err, results) => {
    if (err) {
      console.error("Error adding placement details:", err);
      return res.status(500).json({ message: "Error adding placement details." });
    }
    res.status(201).json({ message: "Placement details added successfully." });
  });
});

// API endpoint to fetch placement data for the bar graph
// API endpoint to fetch placement data for the bar graph
app.get("/placement-data", (req, res) => {
  const query = "SELECT year, studentsPlaced FROM placed_data ORDER BY year DESC"; // Fetch year and studentsPlaced data sorted by year
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching placement data:", err);
      return res.status(500).json({ message: "Error fetching placement data." });
    }

    // Log the fetched results to debug
    console.log("Fetched placement data:", results);

    if (results.length === 0) {
      return res.status(404).json({ message: "No placement data available." });
    }

    res.status(200).json({ placementData: results });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
