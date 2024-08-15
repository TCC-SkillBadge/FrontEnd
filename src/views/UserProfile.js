import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserProfile.css"; // O caminho pode variar dependendo da sua estrutura de pastas
import { PencilSquare } from "react-bootstrap-icons"; // Ícone para edição

const UserProfile = () => {
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    // Fetch user info when component mounts
    const fetchUserInfo = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get("http://localhost:7000/api/user/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
        setFormValues(response.data); // Initialize form values
        setLoading(false);
      } catch (error) {
        setError("Failed to load user data");
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:7000/api/user/update",
        formValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      if (response.status === 200) {
        setUserData(formValues); // Update the displayed data
        setIsEditing(false); // Exit edit mode
        alert("User updated successfully");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user data");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <img src={userData.photo || "/default-avatar.png"} alt="User Avatar" className="profile-photo" />
          <div className="profile-info">
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={formValues.fullName || ""}
                onChange={handleInputChange}
                className="profile-name-input"
              />
            ) : (
              <h2 className="profile-name">{userData.fullName}</h2>
            )}
            <p className="profile-title">{userData.occupation || "Occupation not provided"}</p>
            <button onClick={handleEditToggle} className="edit-button">
              <PencilSquare /> {isEditing ? "Cancelar" : "Editar"}
            </button>
          </div>
        </div>

        {isEditing ? (
          <>
            <div className="profile-section">
              <label>About</label>
              <textarea
                name="about"
                value={formValues.about || ""}
                onChange={handleInputChange}
                className="profile-about-input"
              />
            </div>
            <div className="profile-section">
              <label>Education</label>
              <textarea
                name="education"
                value={formValues.education || ""}
                onChange={handleInputChange}
                className="profile-education-input"
              />
            </div>
            <div className="profile-section">
              <label>Professional Experience</label>
              <textarea
                name="professional_experience"
                value={formValues.professional_experience || ""}
                onChange={handleInputChange}
                className="profile-experience-input"
              />
            </div>
            <div className="profile-section">
              <label>Languages</label>
              <textarea
                name="languages"
                value={formValues.languages || ""}
                onChange={handleInputChange}
                className="profile-languages-input"
              />
            </div>
            <button onClick={handleSaveChanges} className="save-button">
              Save Changes
            </button>
          </>
        ) : (
          <>
            <div className="profile-section">
              <h3>About</h3>
              <p>{userData.about || "No description provided."}</p>
            </div>
            <div className="profile-section">
              <h3>Education</h3>
              <p>{userData.education || "No education details provided."}</p>
            </div>
            <div className="profile-section">
              <h3>Professional Experience</h3>
              <p>{userData.professional_experience || "No work experience details provided."}</p>
            </div>
            <div className="profile-section">
              <h3>Languages</h3>
              <p>{userData.languages || "No languages details provided."}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
