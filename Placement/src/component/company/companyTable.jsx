import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RecruiterTable = () => {
  const [recruiters, setRecruiters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      const res = await axios.get("http://localhost:5000/getRecruiters");
      setRecruiters(res.data);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    }
  };

  return (
    <div>
      <h2>Recruiters</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Logo</th>
          </tr>
        </thead>
        <tbody>
          {recruiters.map((rec) => (
            <tr key={rec.id} onClick={() => navigate(`/company/${rec.id}`)} style={{ cursor: "pointer" }}>
              <td>
                <img
                  src={`http://localhost:5000${rec.logo}`}
                  alt={rec.companyName}
                  width="50"
                  height="50"
                  style={{ borderRadius: "5px" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecruiterTable;
