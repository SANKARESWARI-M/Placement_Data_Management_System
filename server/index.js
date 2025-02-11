const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ramya@123",
    database: "placement"
});

db.connect(err => {
    if (err) {
        console.error("Database Connection Error:", err);
        return;
    }
    console.log("Connected to MySQL Database!");
});

// ✅ Multer Setup for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ✅ POST Route: Upload Data with Files (Includes Company Name and Other Details)
app.post("/recruiters", upload.fields([
    { name: "feedbackPdf" },
    { name: "questionBankPdf" },
    { name: "companyLogo" } // Company logo file upload
]), (req, res) => {
    console.log("Received form data:", req.body);
    console.log("Received files:", req.files);

    // Extract form data
    const { year, noOfStudentsPlaced, company, description, ceoName, headquarters, highestSalary } = req.body;

    // Ensure required fields are valid
    const studentsCount = parseInt(noOfStudentsPlaced, 10);
    if (!year || isNaN(studentsCount) || !company || !description || !ceoName || !headquarters || !highestSalary) {
        return res.status(400).json({ message: "All fields are required and must be valid." });
    }

    // Extract file paths
    const feedback_form = req.files["feedbackPdf"] ? req.files["feedbackPdf"][0].filename : null;
    const question_bank = req.files["questionBankPdf"] ? req.files["questionBankPdf"][0].filename : null;
    const company_logo = req.files["companyLogo"] ? req.files["companyLogo"][0].filename : null;

    // ✅ Insert Data into MySQL (Now includes additional fields)
    const query = `
        INSERT INTO recruiter_data (year, no_of_students, company, feedback_form, question_bank, description, ceo_name, headquarters, highest_salary, company_logo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [year, studentsCount, company, feedback_form, question_bank, description, ceoName, headquarters, highestSalary, company_logo], (err, result) => {
        if (err) {
            console.error("Database Insertion Error:", err);
            return res.status(500).json({ message: "Error uploading data", error: err.message });
        }
        res.status(200).json({ message: "Data uploaded successfully!", data: result });
    });
});

// ✅ GET Route: Fetch Data for a Specific Company
app.get("/recruiters/:company", (req, res) => {
    const company = req.params.company;

    const companyInfoQuery = `
        SELECT company, ceo_name, headquarters, highest_salary, company_logo 
        FROM recruiter_data 
        WHERE company = ? 
        LIMIT 1
    `;

    const yearSpecificDataQuery = `
        SELECT year, no_of_students, question_bank, feedback_form 
        FROM recruiter_data 
        WHERE company = ? ORDER BY year ASC
    `;

    // Fetch both the static company info and year-specific data
    db.query(companyInfoQuery, [company], (err, companyInfoResults) => {
        if (err) {
            console.error("Error fetching company info:", err);
            return res.status(500).json({ message: "Error retrieving company info", error: err.message });
        }

        if (companyInfoResults.length === 0) {
            return res.status(404).json({ message: "Company not found" });
        }

        const companyInfo = companyInfoResults[0]; // Static information

        // Fetch year-specific data
        db.query(yearSpecificDataQuery, [company], (err, yearSpecificDataResults) => {
            if (err) {
                console.error("Error fetching year-specific data:", err);
                return res.status(500).json({ message: "Error retrieving year-specific data", error: err.message });
            }

            const modifiedResults = yearSpecificDataResults.map(item => ({
                year: item.year,
                no_of_students: item.no_of_students,
                question_bank_pdf: item.question_bank ? `http://localhost:5000/uploads/${item.question_bank}` : null,
                feedback_form_pdf: item.feedback_form ? `http://localhost:5000/uploads/${item.feedback_form}` : null,
            }));

            res.status(200).json({ companyInfo, yearSpecificData: modifiedResults });
        });
    });
});


// ✅ Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
