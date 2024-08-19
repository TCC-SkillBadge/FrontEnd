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
  ShareFill,
  FileEarmarkArrowDownFill,
} from "react-bootstrap-icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/UserProfile.css";
import NavBar from "../components/Navbar"; // Importe o NavBar
import { ToastContainer, toast } from "react-toastify"; // Importe o ReactToastify
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners"; // Importe ReactSpinners

const UserProfile = () => {
  const [userData, setUserData] = useState({
    education: [],
    professionalExperience: [],
    languages: [],
    photo: null,
    fullName: "",
    occupation: "",
    country: "",
    phoneNumber: "",
    about: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:7000/api/user/info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userInfo = {
        ...response.data,
        education: Array.isArray(response.data.education)
          ? response.data.education
          : [],
        professionalExperience: Array.isArray(
          response.data.professionalExperience
        )
          ? response.data.professionalExperience
          : [],
        languages: Array.isArray(response.data.languages)
          ? response.data.languages
          : [],
      };

      setUserData(userInfo);
      setLoading(false);
    } catch (error) {
      setError("Failed to load user data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Recarrega os dados do usuário para reverter alterações não salvas
      fetchUserInfo();
    }
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({ ...userData, photo: file });
    }
  };

const handleSaveChanges = async () => {
  try {
    const token = sessionStorage.getItem("token");

    // Preparação dos dados para o envio
    const formData = new FormData();
    if (userData.photo) {
      formData.append("photo", userData.photo); // Adiciona a foto apenas se ela existir
    }
    formData.append("fullName", userData.fullName || "");
    formData.append("occupation", userData.occupation || "");
    formData.append("country", userData.country || "");
    formData.append("phoneNumber", userData.phoneNumber || "");
    formData.append("about", userData.about || "");
    formData.append("education", JSON.stringify(userData.education || []));
    formData.append(
      "professionalExperience",
      JSON.stringify(userData.professionalExperience || [])
    );
    formData.append("languages", JSON.stringify(userData.languages || []));

    // Adiciona logs para depuração
    console.log(
      "Form Data being sent:",
      Object.fromEntries(formData.entries())
    );

    // Envio dos dados para o backend
    await axios.put("http://localhost:7000/api/user/update", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setIsEditing(false);
    toast.success("User updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
    toast.error("Failed to update user data");
  }
};


  const handleShareProfile = () => {
    const encodedEmail = btoa(userData.email); // Codifica o e-mail em base64
    const publicProfileUrl = `${window.location.origin}/public-profile/${encodedEmail}`;
    navigator.clipboard.writeText(publicProfileUrl).then(() => {
      toast.info("Profile URL copied to clipboard!");
    });
  };

  const handleDownloadPortfolio = async () => {
    const doc = new jsPDF("p", "pt", "a4");

    // Exemplo de adicionar um título ao PDF
    doc.setFontSize(20);
    doc.text("User Portfolio", 40, 50);

    // Adicionando informações pessoais
    doc.setFontSize(12);
    doc.text(`Name: ${userData.fullName}`, 40, 90);
    doc.text(`Occupation: ${userData.occupation}`, 40, 110);
    doc.text(`About: ${userData.about}`, 40, 130);

    // Renderizando a seção de educação
    doc.setFontSize(16);
    doc.text("Education:", 40, 160);
    userData.education.forEach((edu, index) => {
      doc.setFontSize(12);
      doc.text(
        `${edu.institution}, ${edu.degree}, ${edu.year}`,
        60,
        180 + index * 20
      );
    });

    // Renderizando a seção de experiência profissional
    doc.setFontSize(16);
    doc.text("Professional Experience:", 40, 240);
    userData.professionalExperience.forEach((exp, index) => {
      doc.setFontSize(12);
      doc.text(
        `${exp.company}, ${exp.position}, ${exp.dates}`,
        60,
        260 + index * 20
      );
    });

    // Renderizando a seção de idiomas
    doc.setFontSize(16);
    doc.text("Languages:", 40, 320);
    userData.languages.forEach((language, index) => {
      doc.setFontSize(12);
      doc.text(`${language}`, 60, 340 + index * 20);
    });

    // Adicionando a imagem do usuário (se disponível)
    if (userData.photo) {
      const imgData = await html2canvas(
        document.querySelector(".profile-photo")
      );
      const imgDataUrl = imgData.toDataURL("image/png");
      doc.addImage(imgDataUrl, "PNG", 400, 40, 100, 100);
    }

    // Salvando o PDF
    doc.save("portfolio.pdf");
    toast.success("Portfolio downloaded successfully");
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader color="#8DFD8B" size={150} />{" "}
        {/* Mostra o spinner de carregamento */}
      </div>
    );
  }

  if (error) {
    toast.error(error);
  }

  return (
    <div className="profile-page">
      <ToastContainer /> {/* Contêiner para os toasts */}
      <NavBar /> {/* Adiciona o NavBar aqui */}
      <div className="profile-container">
        <div className="profile-header">
          <img
            src={
              userData.photo
                ? URL.createObjectURL(userData.photo)
                : "/default-avatar.png"
            }
            alt="User Avatar"
            className="profile-photo"
          />
          {isEditing && <input type="file" onChange={handlePhotoChange} />}
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
              <button
                onClick={handleDownloadPortfolio}
                className="download-button"
              >
                <FileEarmarkArrowDownFill /> Download Portfolio
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
