const mongoose = require("mongoose");

// Define the schema for recruiter data
const recruiterSchema = new mongoose.Schema({
  year: { type: Number, required: true },  // Year field
  count: { type: Number, required: true }  // Number of students (count) field
});

// Create and export the model
const Recruiter = mongoose.model("Recruiter", recruiterSchema);
module.exports = Recruiter;
