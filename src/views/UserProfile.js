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
  GeoAlt,
  Phone,
  CalendarFill,
  PeopleFill,
  ThreeDotsVertical,
} from "react-bootstrap-icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/UserProfile.css";
import NavBar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import PostForm from "../components/PostForm";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    occupation: "",
    sobre: "", // Correção para usar 'sobre' em vez de 'about'
    education: [],
    professionalExperience: [],
    languages: [],
    imageUrl: "",
    razao_social: "",
    cnpj: "",
    municipio: "",
    segmento: "",
    tamanho: "",
    website: "",
    numero_contato: "",
    events: [],
    badges: [],
  });

  // Estado para controlar qual menu de opções está visível
  const [optionsVisibleIndex, setOptionsVisibleIndex] = useState(null);

  // Estado para controlar o evento em edição
  const [editingEvent, setEditingEvent] = useState(null);

  // Função para verificar se o post foi criado há menos de 24 horas
  const isWithin24Hours = (createdAt) => {
    const eventDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now - eventDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  // Função para lidar com o clique no ícone de opções
  const handleOptionsClick = (index) => {
    setOptionsVisibleIndex(optionsVisibleIndex === index ? null : index);
  };

  // Função para editar o evento
  const handleEditEvent = (event) => {
    setEditingEvent(event);
  };

  // Função para excluir o evento
  const handleDeleteEvent = async (event) => {
    const confirmDelete = window.confirm(
      "Do you really want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`http://localhost:7003/api/eventos/${event.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Atualizar o estado removendo o evento deletado
      setUserData((prevUserData) => ({
        ...prevUserData,
        events: prevUserData.events.filter((e) => e.id !== event.id),
      }));
      toast.success("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting the event:", error);
      toast.error("Failed to delete the event.");
    }
  };

  // Função para atualizar o post após edição
  const handlePostUpdated = (updatedPost) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      events: prevUserData.events.map((event) =>
        event.id === updatedPost.id ? updatedPost : event
      ),
    }));
    setEditingEvent(null);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("sobre");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tipoUsuario = sessionStorage.getItem("tipoUsuario");
  const handleNewPost = (newPost) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      events: [newPost, ...prevUserData.events],
    }));
  };

  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", options);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = sessionStorage.getItem("token");
        let response;

        if (!token) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        if (tipoUsuario === "UC") {
          response = await axios.get("http://localhost:7000/api/user/info", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserData({
            ...response.data,
            education: Array.isArray(response.data.education)
              ? response.data.education
              : [],
            professionalExperience: Array.isArray(
              response.data.professional_experience
            )
              ? response.data.professional_experience
              : [],
            languages: Array.isArray(response.data.languages)
              ? response.data.languages
              : [],
          });
        } else if (tipoUsuario === "UE") {
          response = await axios.get(
            "http://localhost:7003/api/acessar-info-usuario-jwt",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // **Usar o endpoint correto para obter os eventos**
          const eventsResponse = await axios.get(
            "http://localhost:7003/api/eventos",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUserData({
            ...response.data,
            email_comercial: response.data.email_comercial, // Adicionado
            sobre: response.data.sobre || "",
            website: response.data.website || "",
            events: eventsResponse.data || [],
            badges: response.data.badges || [],
          });

          console.log("Loaded events:", eventsResponse.data);
        } else {
          setError("Invalid user type");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user information:", error);
        setError("Failed to load user data");
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [tipoUsuario]);

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
      updatedArray[index] = e.target.value;
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

  const handleFileChange = (e) => {
    setUserData({ ...userData, photo: e.target.files[0] });
  };

  const handleSaveChanges = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      if (userData.photo) {
        formData.append("photo", userData.photo);
      }

      if (tipoUsuario === "UC") {
        formData.append("fullName", userData.fullName || "");
        formData.append("occupation", userData.occupation || "");
        formData.append("country", userData.country || "");
        formData.append("phoneNumber", userData.phoneNumber || "");
        formData.append("about", userData.sobre || ""); // Ajuste 'about' para 'sobre'
        formData.append("education", JSON.stringify(userData.education || []));
        formData.append(
          "professionalExperience",
          JSON.stringify(userData.professionalExperience || [])
        );
        formData.append("languages", JSON.stringify(userData.languages || []));

        await axios.put("http://localhost:7000/api/user/update", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (tipoUsuario === "UE") {
        formData.append("razao_social", userData.razao_social || "");
        formData.append("cnpj", userData.cnpj || "");
        formData.append("cep", userData.cep || "");
        formData.append("logradouro", userData.logradouro || "");
        formData.append("bairro", userData.bairro || "");
        formData.append("municipio", userData.municipio || "");
        formData.append("suplemento", userData.suplemento || "");
        formData.append("numero_contato", userData.numero_contato || "");
        formData.append("sobre", userData.sobre || ""); // Ajuste 'about' para 'sobre'
        formData.append("website", userData.website || "");

        await axios.put("http://localhost:7003/api/update", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setIsEditing(false);
      toast.success("Data updated successfully");
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update user data");
    }
  };

  const handleShareProfile = () => {
    let encodedEmail;
    let publicProfileUrl;

    if (tipoUsuario === "UC") {
      if (!userData.email) {
        toast.error("Email not available.");
        return;
      }
      encodedEmail = btoa(userData.email);
      publicProfileUrl = `${window.location.origin}/public-profile/${encodedEmail}`;
    } else if (tipoUsuario === "UE") {
      if (!userData.email_comercial) {
        toast.error("Commercial email not available.");
        return;
      }
      encodedEmail = btoa(userData.email_comercial);
      publicProfileUrl = `${window.location.origin}/public-profile-enterprise/${encodedEmail}`;
    } else {
      toast.error("Invalid user type.");
      return;
    }

    navigator.clipboard
      .writeText(publicProfileUrl)
      .then(() => {
        toast.info("Profile URL copied to clipboard!");
      })
      .catch((error) => {
        console.error("Error copying the link:", error);
        toast.error("Failed to copy the link.");
      });
  };

  const handleDownloadPortfolio = async () => {
    const doc = new jsPDF("p", "pt", "a4");

    doc.setFontSize(20);
    doc.text("User Portfolio", 40, 50);

    doc.setFontSize(12);
    doc.text(`Name: ${userData.fullName}`, 40, 90);
    doc.text(`Occupation: ${userData.occupation}`, 40, 110);
    doc.text(`About: ${userData.sobre}`, 40, 130);

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

    doc.setFontSize(16);
    doc.text("Languages:", 40, 320);
    userData.languages.forEach((language, index) => {
      doc.setFontSize(12);
      doc.text(`${language}`, 60, 340 + index * 20);
    });

    if (userData.imageUrl) {
      const imgElement = document.createElement("img");
      imgElement.src = userData.imageUrl;
      imgElement.onload = async () => {
        const canvas = await html2canvas(imgElement);
        const imgDataUrl = canvas.toDataURL("image/png");
        doc.addImage(imgDataUrl, "PNG", 400, 40, 100, 100);
        doc.save("portfolio.pdf");
      };
    } else {
      doc.save("portfolio.pdf");
    }

    toast.success("Portfolio downloaded successfully");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader color="#8DFD8B" size={150} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  if (tipoUsuario === "UC") {
    return (
      <div className="profile-page">
        <ToastContainer />
        <NavBar />
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-photo-wrapper">
              <img
                src={userData.imageUrl || "/default-avatar.png"}
                alt="User Avatar"
                className="profile-photo"
              />
              {isEditing && (
                <>
                  <label htmlFor="upload-photo" className="edit-photo-icon">
                    <PencilSquare />
                  </label>
                  <input
                    type="file"
                    id="upload-photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </>
              )}
            </div>
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
                  <ShareFill /> Share
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

          {isEditing ? (
            <div className="profile-sections">
              <div className="profile-section">
                <label>
                  <PersonFill className="icon" /> About
                </label>
                <textarea
                  name="sobre" // Ajuste 'about' para 'sobre'
                  value={userData.sobre || ""}
                  onChange={handleInputChange}
                  className="profile-about-input"
                />
              </div>

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

              <div className="profile-section">
                <h3>
                  <Briefcase className="icon" /> Professional Experience
                </h3>
                {userData.professionalExperience.map((exp, index) => (
                  <div key={index} className="profile-array-item">
                    <Building className="icon" />
                    <input
                      type="text"
                      value={exp.company || ""}
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
                      value={exp.position || ""}
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
                      value={exp.dates || ""}
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
                      company: "",
                      position: "",
                      dates: "",
                    })
                  }
                  className="add-button"
                >
                  <PlusSquare /> Add
                </button>
              </div>

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
                <p>{userData.sobre || "No description provided."}</p>
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
                  <p>No educational information provided.</p>
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
                        <span className="profile-info-text">
                          {exp.position}
                        </span>
                      </div>
                      <div className="profile-info-row">
                        <span className="education-dates">{exp.dates}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No professional experience provided.</p>
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
  } else if (tipoUsuario === "UE") {
    return (
      <div className="profile-page">
        <ToastContainer />
        <NavBar />
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-photo-wrapper">
              <img
                src={userData.imageUrl || "/default-company-logo.png"}
                alt="Company Logo"
                className="profile-photo"
              />
              {isEditing && (
                <>
                  <label htmlFor="upload-photo" className="edit-photo-icon">
                    <PencilSquare />
                  </label>
                  <input
                    type="file"
                    id="upload-photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </>
              )}
            </div>
            <div className="profile-info">
              {isEditing ? (
                <input
                  type="text"
                  name="razao_social"
                  value={userData.razao_social || ""}
                  onChange={handleInputChange}
                  className="profile-name-input"
                />
              ) : (
                <h2 className="profile-name">{userData.razao_social}</h2>
              )}
              <p className="profile-title">
                {userData.cnpj || "CNPJ not provided"}
              </p>
              <div className="company-badges">
                {userData.municipio && (
                  <span className="company-badge">
                    <GeoAlt /> {userData.municipio}
                  </span>
                )}
                {userData.segmento && (
                  <span className="company-badge">
                    <Briefcase /> {userData.segmento}
                  </span>
                )}
                {userData.tamanho && (
                  <span className="company-badge">
                    <PeopleFill /> {userData.tamanho}
                  </span>
                )}
              </div>
              <div className="profile-actions">
                <button onClick={handleEditToggle} className="edit-button">
                  <PencilSquare /> {isEditing ? "Cancelar" : "Editar"}
                </button>
                <button onClick={handleShareProfile} className="share-button">
                  <ShareFill /> Share Profile
                </button>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button
              onClick={() => handleTabChange("sobre")}
              className={activeTab === "sobre" ? "active" : ""}
            >
              About
            </button>
            <button
              onClick={() => handleTabChange("eventos")}
              className={activeTab === "eventos" ? "active" : ""}
            >
              Events
            </button>
            <button
              onClick={() => handleTabChange("badges")}
              className={activeTab === "badges" ? "active" : ""}
            >
              Badges
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "sobre" && (
              <div className="sobre-section">
                {isEditing ? (
                  <>
                    <div className="profile-section">
                      <label>
                        <PersonFill className="icon" /> About
                      </label>
                      <textarea
                        name="sobre" // Ajuste 'about' para 'sobre'
                        value={userData.sobre || ""}
                        onChange={handleInputChange}
                        className="profile-about-input"
                      />
                    </div>
                    <div className="profile-section">
                      <label>
                        <Globe className="icon" /> Website
                      </label>
                      <input
                        type="text"
                        name="website"
                        value={userData.website || ""}
                        onChange={handleInputChange}
                        className="profile-input"
                      />
                    </div>
                    <div className="profile-section">
                      <label>
                        <Phone className="icon" /> Phone
                      </label>
                      <input
                        type="text"
                        name="numero_contato"
                        value={userData.numero_contato || ""}
                        onChange={handleInputChange}
                        className="profile-input"
                      />
                    </div>
                    <button onClick={handleSaveChanges} className="save-button">
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <div className="profile-section">
                      <h3>
                        <PersonFill className="icon" /> About
                      </h3>
                      <p>{userData.sobre || "No description provided."}</p>
                    </div>
                    <div className="profile-section">
                      <h3>
                        <Globe className="icon" /> Website
                      </h3>
                      <p>{userData.website || "Not provided"}</p>
                    </div>
                    <div className="profile-section">
                      <h3>
                        <Phone className="icon" /> Phone
                      </h3>
                      <p>{userData.numero_contato || "Not provided"}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "eventos" && (
              <div className="eventos-section">
                <h3>Promoted Events</h3>

                {/* Componente para criar novos posts */}
                <PostForm onPostCreated={handleNewPost} />

                {/* Renderizar o PostForm para edição */}
                {editingEvent && (
                  <PostForm
                    existingEvent={editingEvent}
                    onPostUpdated={handlePostUpdated}
                    onClose={() => setEditingEvent(null)}
                    isEditAllowed={isWithin24Hours(editingEvent.createdAt)}
                  />
                )}

                {/* Renderização dos eventos */}
                {userData.events && userData.events.length > 0 ? (
                  userData.events.map((event, index) => (
                    <div key={index} className="event-item">
                      <div className="event-header">
                        <img
                          src={userData.imageUrl || "/default-avatar.png"}
                          alt="User Avatar"
                          className="event-user-avatar"
                        />
                        <span className="event-user-name">
                          {userData.razao_social}
                        </span>

                        {/* Exibição da Data e Hora de Publicação */}
                        {event.createdAt && (
                          <span className="event-publication-time">
                            {formatDateTime(event.createdAt)}
                          </span>
                        )}

                        {/* Ícone de três pontinhos sempre visível */}
                        <div className="event-options">
                          <ThreeDotsVertical
                            className="options-icon"
                            onClick={() => handleOptionsClick(index)}
                          />
                          {optionsVisibleIndex === index && (
                            <div className="options-menu">
                              {/* Botão "Editar" habilitado apenas se dentro de 24h */}
                              <button
                                onClick={() => handleEditEvent(event)}
                                disabled={!isWithin24Hours(event.createdAt)}
                                style={{
                                  cursor: isWithin24Hours(event.createdAt)
                                    ? "pointer"
                                    : "not-allowed",
                                  opacity: isWithin24Hours(event.createdAt)
                                    ? 1
                                    : 0.5,
                                }}
                                title={
                                  !isWithin24Hours(event.createdAt)
                                    ? "Editing available only within the first 24 hours"
                                    : "Edit Event"
                                }
                              >
                                Edit
                              </button>
                              {/* Botão "Excluir" sempre habilitado */}
                              <button onClick={() => handleDeleteEvent(event)}>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="event-details">
                        <p>{event.descricao || "No description"}</p>
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt="Event Image"
                            className="event-image"
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No events available.</p>
                )}
              </div>
            )}

            {activeTab === "badges" && (
              <div className="badges-section">
                <h3>Earned Badges</h3>
                {userData.badges && userData.badges.length > 0 ? (
                  <div className="badges-grid">
                    {userData.badges.map((badge, index) => (
                      <div key={index} className="badge-item">
                        <AwardFill className="badge-icon" />
                        <span>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No badges available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return null; // Ou redirecione para o login
  }
};

export default UserProfile;
