import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserProfile.css";
import { PencilSquare, Trash, PlusSquare } from "react-bootstrap-icons";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    education: [],
    professionalExperience: [],
    languages: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({
    education: [],
    professionalExperience: [],
    languages: [],
  });

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
        setFormValues(userInfo);
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

  const handleArrayChange = (e, index, key, arrayKey) => {
    const updatedArray = [...formValues[arrayKey]];

    if (arrayKey === "languages") {
      updatedArray[index] = e.target.value; // Para languages, atualiza diretamente a string
    } else {
      updatedArray[index][key] = e.target.value;
    }

    setFormValues({ ...formValues, [arrayKey]: updatedArray });
  };

  const handleAddItem = (arrayKey, newItem) => {
    setFormValues({
      ...formValues,
      [arrayKey]: [...formValues[arrayKey], newItem],
    });
  };

  const handleRemoveItem = (index, arrayKey) => {
    const updatedArray = formValues[arrayKey].filter((_, i) => i !== index);
    setFormValues({ ...formValues, [arrayKey]: updatedArray });
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
          },
        }
      );
      if (response.status === 200) {
        setUserData(formValues);
        setIsEditing(false);
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
                value={formValues.fullName || ""}
                onChange={handleInputChange}
                className="profile-name-input"
              />
            ) : (
              <h2 className="profile-name">{userData.fullName}</h2>
            )}
            <p className="profile-title">
              {userData.occupation || "Occupation not provided"}
            </p>
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
              <h3>Education</h3>
              {formValues.education.map((edu, index) => (
                <div key={index} className="profile-array-item">
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
                    value={edu.institution}
                    placeholder="Institution"
                    onChange={(e) =>
                      handleArrayChange(e, index, "institution", "education")
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

            <div className="profile-section">
              <h3>Professional Experience</h3>
              {formValues.professionalExperience.map((exp, index) => (
                <div key={index} className="profile-array-item">
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

            <div className="profile-section">
              <h3>Languages</h3>
              {formValues.languages.map((language, index) => (
                <div key={index} className="profile-array-item">
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
          </>
        ) : (
          <>
            <div className="profile-section">
              <h3>About</h3>
              <p>{userData.about || "No description provided."}</p>
            </div>
            <div className="profile-section">
              <h3>Education</h3>
              {Array.isArray(userData.education) &&
              userData.education.length > 0 ? (
                userData.education.map((edu, index) => (
                  <p key={index}>
                    {edu.degree} - {edu.institution} ({edu.year})
                  </p>
                ))
              ) : (
                <p>No education details provided.</p>
              )}
            </div>
            <div className="profile-section">
              <h3>Professional Experience</h3>
              {Array.isArray(userData.professionalExperience) &&
              userData.professionalExperience.length > 0 ? (
                userData.professionalExperience.map((exp, index) => (
                  <p key={index}>
                    {exp.position} - {exp.company} ({exp.dates})
                  </p>
                ))
              ) : (
                <p>No work experience details provided.</p>
              )}
            </div>
            <div className="profile-section">
              <h3>Languages</h3>
              {Array.isArray(userData.languages) &&
              userData.languages.length > 0 ? (
                userData.languages.map((language, index) => (
                  <p key={index}>{language}</p>
                ))
              ) : (
                <p>No languages provided.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
