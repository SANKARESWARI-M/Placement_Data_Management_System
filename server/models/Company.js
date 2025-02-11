const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    year: { type: Number, required: true },
    studentsPlaced: { type: Number, required: true },
    studentNames: { type: [String], required: true }, // Array of student names
    qbPdf: { type: String, required: true }, // File path for the QB PDF
    feedbackForm: { type: String, required: true } // File path for the feedback form
});

const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;
