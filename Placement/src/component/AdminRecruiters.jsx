import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link from React Router

const AdminRecruiters = () => {
  const [companyData, setCompanyData] = useState({
    companyName: '',
    description: '',
    ceo: '',
    location: '',
    logo: null,
  });

  const [companyLogos, setCompanyLogos] = useState([]);

  useEffect(() => {
    const fetchCompanyLogos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/companies');
        console.log(response.data);
        setCompanyLogos(response.data.companies);
      } catch (error) {
        console.error('Error fetching companies:', error.response ? error.response.data : error.message);
      }
    };

    fetchCompanyLogos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
  };

  const handleFileChange = (e) => {
    setCompanyData({ ...companyData, logo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('companyName', companyData.companyName);
    formData.append('description', companyData.description);
    formData.append('ceo', companyData.ceo);
    formData.append('location', companyData.location);
    formData.append('logo', companyData.logo);

    try {
      const response = await axios.post('http://localhost:5000/add-company', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Company added:', response.data);
      // You can add code to update the UI after successful submission (e.g., reset form or fetch updated companies)
    } catch (error) {
      console.error('Error adding company:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <h2>Add New Company</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={companyData.companyName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={companyData.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="ceo"
          placeholder="CEO"
          value={companyData.ceo}
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={companyData.location}
          onChange={handleChange}
        />
        <input
          type="file"
          name="logo"
          onChange={handleFileChange}
        />
        <button type="submit">Add Company</button>
      </form>

      <h3>Company Logos</h3>
      <div className="company-logos">
        {companyLogos.length > 0 ? (
          companyLogos.map((company) => (
            <div key={company.companyName} className="company-logo">
              <Link to={`/company/${company.companyName}`} state={{ company }}>
                <img
                  src={`http://localhost:5000/uploads/${company.logo}`} // Correct path for the image
                  alt={company.companyName}
                  style={{ width: '100px', height: 'auto', margin: '10px', cursor: 'pointer' }}
                />
              </Link>
            </div>
          ))
        ) : (
          <p>No company logos available</p>
        )}
      </div>
    </div>
  );
};

export default AdminRecruiters;
