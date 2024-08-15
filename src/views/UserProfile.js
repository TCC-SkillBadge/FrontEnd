import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import "../styles/UserProfile.css"; // CSS para o perfil do usuário
import { PencilSquare } from "react-bootstrap-icons"; // Ícone para edição

const UserProfile = () => {
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const isCurrentUser = true; // Supondo que você vai definir isso baseado no login do usuário

  useEffect(() => {
    // Supondo que os dados do usuário foram armazenados no sessionStorage
    const storedUserInfo = JSON.parse(sessionStorage.getItem("userInfo"));
    setUserData(storedUserInfo);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    // Função para salvar as mudanças (enviar ao backend)
    try {
      const response = await axios.put(
        "http://localhost:9090/api/user/update",
        userData
      );
      if (response.status === 200) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Erro ao salvar as alterações:", error);
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
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
                name="name"
                value={userData.name || ""}
                onChange={handleInputChange}
                className="profile-name-input"
              />
            ) : (
              <h2 className="profile-name">{userData.name}</h2>
            )}
            <p className="profile-title">
              {userData.title || "Software Engineer at Acme Inc."}
            </p>
            {isCurrentUser && (
              <button onClick={handleEditToggle} className="edit-button">
                <PencilSquare /> {isEditing ? "Cancelar" : "Editar"}
              </button>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>
            About <PencilSquare className="section-icon" />
          </h3>
          {isEditing ? (
            <textarea
              name="about"
              value={userData.about || ""}
              onChange={handleInputChange}
              className="profile-about-input"
            />
          ) : (
            <p>{userData.about || "I am a passionate software engineer..."}</p>
          )}
        </div>

        <div className="profile-section">
          <h3>
            Education <PencilSquare className="section-icon" />
          </h3>
          {isEditing ? (
            <textarea
              name="education"
              value={userData.education || ""}
              onChange={handleInputChange}
              className="profile-education-input"
            />
          ) : (
            <p>
              {userData.education || "University of California, Berkeley..."}
            </p>
          )}
        </div>

        <div className="profile-section">
          <h3>
            Work Experience <PencilSquare className="section-icon" />
          </h3>
          {isEditing ? (
            <textarea
              name="professional_experience"
              value={userData.professional_experience || ""}
              onChange={handleInputChange}
              className="profile-experience-input"
            />
          ) : (
            <p>{userData.professional_experience || "Acme Inc..."}</p>
          )}
        </div>

        <div className="profile-section">
          <h3>
            Languages <PencilSquare className="section-icon" />
          </h3>
          {isEditing ? (
            <textarea
              name="languages"
              value={userData.languages || ""}
              onChange={handleInputChange}
              className="profile-languages-input"
            />
          ) : (
            <p>{userData.languages || "English, Spanish..."}</p>
          )}
        </div>

        {isCurrentUser && isEditing && (
          <button onClick={handleSaveChanges} className="save-button">
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
