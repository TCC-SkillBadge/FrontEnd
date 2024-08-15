import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PencilSquare,
  Trash,
  PlusSquare,
  AwardFill,
  Building,
  Briefcase,
  Globe,
  Flag,
  PersonFill,
  MortarboardFill,
  ShareFill, // Ícone de compartilhar
} from "react-bootstrap-icons";
import "../styles/UserProfile.css";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    education: [],
    professionalExperience: [],
    languages: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:7000/api/user/info",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const userInfo = {
          ...response.data,
          education: response.data.education || [],
          professionalExperience: response.data.professionalExperience || [],
          languages: response.data.languages || [],
        };

        setUserData(userInfo);
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
    setUserData({ ...userData, [name]: value });
  };

  const handleArrayChange = (e, index, key, arrayKey) => {
    const updatedArray = [...userData[arrayKey]];

    if (arrayKey === "languages") {
      updatedArray[index] = e.target.value; // Para languages, atualiza diretamente a string
    } else {
      updatedArray[index][key] = e.target.value;
    }

    setUserData({ ...userData, [arrayKey]: updatedArray });
  };

  const handleAddItem = (arrayKey, newItem) => {
    setUserData({
      ...userData,
      [arrayKey]: [...userData[arrayKey], newItem],
    });
  };

  const handleRemoveItem = (index, arrayKey) => {
    const updatedArray = userData[arrayKey].filter((_, i) => i !== index);
    setUserData({ ...userData, [arrayKey]: updatedArray });
  };

  const handleSaveChanges = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put("http://localhost:7000/api/user/update", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsEditing(false);
      alert("User updated successfully");
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user data");
    }
  };

  const handleShareProfile = () => {
    const encodedEmail = btoa(userData.email); // Codifica o e-mail em base64
    const publicProfileUrl = `${window.location.origin}/public-profile/${encodedEmail}`;
    navigator.clipboard.writeText(publicProfileUrl).then(() => {
      alert("Profile URL copied to clipboard!");
    });
  };

  if (loading) {
    return <div className="spinner-container">Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <img
            src={userData.photo || "/default-avatar.png"}
            alt="User Avatar"
            className="profile-photo"
          />
          <div className="profile-info">
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={userData.fullName || ""}
                onChange={handleInputChange}
                className="profile-name-input"
              />
            ) : (
              <h2 className="profile-name">{userData.fullName}</h2>
            )}
            <p className="profile-title">
              {userData.occupation || "Occupation not provided"}
            </p>
            <div className="profile-actions">
              <button onClick={handleEditToggle} className="edit-button">
                <PencilSquare /> {isEditing ? "Cancelar" : "Editar"}
              </button>
              <button onClick={handleShareProfile} className="share-button">
                <ShareFill /> Compartilhar
              </button>
            </div>
          </div>
        </div>

        {/* Seção de Edição ou Exibição */}
        {isEditing ? (
          <div className="profile-sections">
            {/* Edição de About */}
            <div className="profile-section">
              <label>
                <PersonFill className="icon" /> About
              </label>
              <textarea
                name="about"
                value={userData.about || ""}
                onChange={handleInputChange}
                className="profile-about-input"
              />
            </div>

            {/* Edição de Educação */}
            <div className="profile-section">
              <h3>
                <MortarboardFill className="icon" /> Education
              </h3>
              {userData.education.map((edu, index) => (
                <div key={index} className="profile-array-item">
                  <Building className="icon" />
                  <input
                    type="text"
                    value={edu.institution}
                    placeholder="Institution"
                    onChange={(e) =>
                      handleArrayChange(e, index, "institution", "education")
                    }
                    className="profile-input"
                  />
                  <AwardFill className="icon" />
                  <input
                    type="text"
                    value={edu.degree}
                    placeholder="Degree"
                    onChange={(e) =>
                      handleArrayChange(e, index, "degree", "education")
                    }
                    className="profile-input"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    placeholder="Year"
                    onChange={(e) =>
                      handleArrayChange(e, index, "year", "education")
                    }
                    className="profile-input"
                  />
                  <button
                    onClick={() => handleRemoveItem(index, "education")}
                    className="delete-button"
                  >
                    <Trash />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  handleAddItem("education", {
                    degree: "",
                    institution: "",
                    year: "",
                  })
                }
                className="add-button"
              >
                <PlusSquare /> Add
              </button>
            </div>

            {/* Edição de Experiência Profissional */}
            <div className="profile-section">
              <h3>
                <Briefcase className="icon" /> Professional Experience
              </h3>
              {userData.professionalExperience.map((exp, index) => (
                <div key={index} className="profile-array-item">
                  <Building className="icon" />
                  <input
                    type="text"
                    value={exp.company}
                    placeholder="Company"
                    onChange={(e) =>
                      handleArrayChange(
                        e,
                        index,
                        "company",
                        "professionalExperience"
                      )
                    }
                    className="profile-input"
                  />
                  <Briefcase className="icon" />
                  <input
                    type="text"
                    value={exp.position}
                    placeholder="Position"
                    onChange={(e) =>
                      handleArrayChange(
                        e,
                        index,
                        "position",
                        "professionalExperience"
                      )
                    }
                    className="profile-input"
                  />
                  <input
                    type="text"
                    value={exp.dates}
                    placeholder="Dates"
                    onChange={(e) =>
                      handleArrayChange(
                        e,
                        index,
                        "dates",
                        "professionalExperience"
                      )
                    }
                    className="profile-input"
                  />
                  <button
                    onClick={() =>
                      handleRemoveItem(index, "professionalExperience")
                    }
                    className="delete-button"
                  >
                    <Trash />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  handleAddItem("professionalExperience", {
                    position: "",
                    company: "",
                    dates: "",
                  })
                }
                className="add-button"
              >
                <PlusSquare /> Add
              </button>
            </div>

            {/* Edição de Idiomas */}
            <div className="profile-section">
              <h3>
                <Globe className="icon" /> Languages
              </h3>
              {userData.languages.map((language, index) => (
                <div key={index} className="profile-array-item">
                  <Flag className="icon" />
                  <input
                    type="text"
                    value={language}
                    placeholder="Language"
                    onChange={(e) =>
                      handleArrayChange(e, index, null, "languages")
                    }
                    className="profile-input"
                  />
                  <button
                    onClick={() => handleRemoveItem(index, "languages")}
                    className="delete-button"
                  >
                    <Trash />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddItem("languages", "")}
                className="add-button"
              >
                <PlusSquare /> Add
              </button>
            </div>

            <button onClick={handleSaveChanges} className="save-button">
              Save Changes
            </button>
          </div>
        ) : (
          <div className="profile-sections">
            <div className="profile-section">
              <h3>
                <PersonFill className="icon" /> About
              </h3>
              <p>{userData.about || "No description provided."}</p>
            </div>
            <div className="profile-section">
              <h3>
                <MortarboardFill className="icon" /> Education
              </h3>
              {Array.isArray(userData.education) &&
              userData.education.length > 0 ? (
                userData.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="profile-info-row">
                      <Building className="icon" />
                      <span className="institution-name">
                        {edu.institution}
                      </span>
                    </div>
                    <div className="profile-info-row">
                      <AwardFill className="icon" />
                      <span className="education-degree">{edu.degree}</span>
                    </div>
                    <div className="profile-info-row">
                      <span className="education-dates">{edu.year}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No education details provided.</p>
              )}
            </div>
            <div className="profile-section">
              <h3>
                <Briefcase className="icon" /> Professional Experience
              </h3>
              {Array.isArray(userData.professionalExperience) &&
              userData.professionalExperience.length > 0 ? (
                userData.professionalExperience.map((exp, index) => (
                  <div key={index}>
                    <div className="profile-info-row">
                      <Building className="icon" />
                      <span className="profile-info-text">{exp.company}</span>
                    </div>
                    <div className="profile-info-row">
                      <Briefcase className="icon" />
                      <span className="profile-info-text">{exp.position}</span>
                    </div>
                    <div className="profile-info-row">
                      <span className="education-dates">{exp.dates}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No work experience details provided.</p>
              )}
            </div>
            <div className="profile-section">
              <h3>
                <Globe className="icon" /> Languages
              </h3>
              {Array.isArray(userData.languages) &&
              userData.languages.length > 0 ? (
                userData.languages.map((language, index) => (
                  <div key={index} className="profile-info-row">
                    <Flag className="icon" />
                    <span className="profile-info-text">{language}</span>
                  </div>
                ))
              ) : (
                <p>No languages provided.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
