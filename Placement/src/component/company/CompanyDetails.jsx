import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2"; // Importing Bar chart from react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register the necessary components of Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompanyDetails = () => {
  const location = useLocation();
  const company = location.state?.company;

  const [placementData, setPlacementData] = useState({
    companyName: company?.companyName || "",
    year: new Date().getFullYear(), // Default current year
    studentsPlaced: "",
    questionBank: null,
    feedbackForm: null,
    placementTrends: [] // Add placement trends data for the chart
  });

  const [chartData, setChartData] = useState({
    labels: [], // Years will be fetched here
    datasets: [
      {
        label: "Number of Students Placed",
        data: [], // Number of students placed will be fetched here
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
        borderColor: "rgba(75, 192, 192, 1)", // Bar border color
        borderWidth: 1,
      },
    ],
  });

  // If company data isn't found, display error message
  if (!company) {
    return <p>Company not found</p>;
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlacementData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setPlacementData((prevData) => ({
      ...prevData,
      [name]: files[0], // Store selected file
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate number of students placed is a positive number
    if (placementData.studentsPlaced <= 0) {
      alert("Please enter a valid number of students placed.");
      return;
    }

    const formData = new FormData();
    formData.append("companyName", placementData.companyName);
    formData.append("year", placementData.year);
    formData.append("studentsPlaced", placementData.studentsPlaced);
    formData.append("questionBank", placementData.questionBank);
    formData.append("feedbackForm", placementData.feedbackForm);

    try {
      const response = await axios.post("http://localhost:5000/add-placement", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data);
      alert("Placement details submitted successfully!");
      // Optionally update placement trends or other relevant data after successful submission
    } catch (error) {
      console.error("Error submitting placement details:", error.response?.data || error.message);
      alert("Error submitting placement details. Please try again later.");
    }
  };

  // Fetch placement data for chart on component mount
  useEffect(() => {
    const fetchPlacementData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/get-placement-trends"); // Replace with actual API endpoint
        const fetchedData = response.data; // Assume this data has year and studentsPlaced

        // Prepare data for the chart
        const years = fetchedData.map((item) => item.year); // Assuming the data has 'year' field
        const studentsPlaced = fetchedData.map((item) => item.studentsPlaced); // Assuming the data has 'studentsPlaced' field

        // Update chartData state
        setChartData({
          labels: years,
          datasets: [
            {
              label: "Number of Students Placed",
              data: studentsPlaced,
              backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
              borderColor: "rgba(75, 192, 192, 1)", // Bar border color
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching placement data:", error);
      }
    };

    fetchPlacementData();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Graph options (customize as needed)
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Placement Trends Over the Years",
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Ensures the y-axis starts at 0
      },
    },
  };

  return (
    <div>
      <h2>{company.companyName}</h2>
      <p><strong>Description:</strong> {company.description}</p>
      <p><strong>CEO:</strong> {company.ceo}</p>
      <p><strong>Location:</strong> {company.location}</p>
      <img src={`http://localhost:5000/${company.logo}`} alt={company.companyName} style={{ width: "200px", height: "auto" }} />

      {/* Display the Bar chart */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <h3>Update Student Placement Details</h3>
      <form onSubmit={handleSubmit}>
        <label>Company Name:</label>
        <input type="text" name="companyName" value={placementData.companyName} disabled />

        <label>Year:</label>
        <select name="year" value={placementData.year} onChange={handleChange}>
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <label>Number of Students Placed:</label>
        <input
          type="number"
          name="studentsPlaced"
          value={placementData.studentsPlaced}
          onChange={handleChange}
          required
          min="1"
        />

        <label>Upload Question Bank (PDF):</label>
        <input
          type="file"
          name="questionBank"
          accept="application/pdf"
          onChange={handleFileChange}
          required
        />

        <label>Upload Feedback Form (PDF):</label>
        <input
          type="file"
          name="feedbackForm"
          accept="application/pdf"
          onChange={handleFileChange}
          required
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CompanyDetails;
