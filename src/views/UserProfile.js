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
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = sessionStorage.getItem("token");
        let response;

        if (!token) {
          setError("Usuário não autenticado");
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
            sobre: response.data.sobre || "",
            website: response.data.website || "",
            events: eventsResponse.data || [],
            badges: response.data.badges || [],
          });

          console.log("Eventos carregados:", eventsResponse.data);
        } else {
          setError("Tipo de usuário inválido");
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
        setError("Falha ao carregar os dados do usuário");
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
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar os dados do usuário:", error);
      toast.error("Falha ao atualizar os dados do usuário");
    }
  };

  const handleShareProfile = () => {
    const encodedEmail = btoa(userData.email);
    const publicProfileUrl = `${window.location.origin}/public-profile/${encodedEmail}`;
    navigator.clipboard.writeText(publicProfileUrl).then(() => {
      toast.info("URL do perfil copiada para a área de transferência!");
    });
  };

  const handleDownloadPortfolio = async () => {
    const doc = new jsPDF("p", "pt", "a4");

    doc.setFontSize(20);
    doc.text("Portfólio do Usuário", 40, 50);

    doc.setFontSize(12);
    doc.text(`Nome: ${userData.fullName}`, 40, 90);
    doc.text(`Ocupação: ${userData.occupation}`, 40, 110);
    doc.text(`Sobre: ${userData.sobre}`, 40, 130); // Ajuste 'about' para 'sobre'

    doc.setFontSize(16);
    doc.text("Educação:", 40, 160);
    userData.education.forEach((edu, index) => {
      doc.setFontSize(12);
      doc.text(
        `${edu.institution}, ${edu.degree}, ${edu.year}`,
        60,
        180 + index * 20
      );
    });

    doc.setFontSize(16);
    doc.text("Experiência Profissional:", 40, 240);
    userData.professionalExperience.forEach((exp, index) => {
      doc.setFontSize(12);
      doc.text(
        `${exp.company}, ${exp.position}, ${exp.dates}`,
        60,
        260 + index * 20
      );
    });

    doc.setFontSize(16);
    doc.text("Idiomas:", 40, 320);
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

    toast.success("Portfólio baixado com sucesso");
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
                {userData.occupation || "Ocupação não informada"}
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
                  <FileEarmarkArrowDownFill /> Baixar Portfólio
                </button>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="profile-sections">
              <div className="profile-section">
                <label>
                  <PersonFill className="icon" /> Sobre
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
                  <MortarboardFill className="icon" /> Educação
                </h3>
                {userData.education.map((edu, index) => (
                  <div key={index} className="profile-array-item">
                    <Building className="icon" />
                    <input
                      type="text"
                      value={edu.institution}
                      placeholder="Instituição"
                      onChange={(e) =>
                        handleArrayChange(e, index, "institution", "education")
                      }
                      className="profile-input"
                    />
                    <AwardFill className="icon" />
                    <input
                      type="text"
                      value={edu.degree}
                      placeholder="Grau"
                      onChange={(e) =>
                        handleArrayChange(e, index, "degree", "education")
                      }
                      className="profile-input"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      placeholder="Ano"
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
                  <PlusSquare /> Adicionar
                </button>
              </div>

              <div className="profile-section">
                <h3>
                  <Briefcase className="icon" /> Experiência Profissional
                </h3>
                {userData.professionalExperience.map((exp, index) => (
                  <div key={index} className="profile-array-item">
                    <Building className="icon" />
                    <input
                      type="text"
                      value={exp.company || ""}
                      placeholder="Empresa"
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
                      placeholder="Cargo"
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
                      placeholder="Período"
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
                  <PlusSquare /> Adicionar
                </button>
              </div>

              <div className="profile-section">
                <h3>
                  <Globe className="icon" /> Idiomas
                </h3>
                {userData.languages.map((language, index) => (
                  <div key={index} className="profile-array-item">
                    <Flag className="icon" />
                    <input
                      type="text"
                      value={language}
                      placeholder="Idioma"
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
                  <PlusSquare /> Adicionar
                </button>
              </div>

              <button onClick={handleSaveChanges} className="save-button">
                Salvar Alterações
              </button>
            </div>
          ) : (
            <div className="profile-sections">
              <div className="profile-section">
                <h3>
                  <PersonFill className="icon" /> Sobre
                </h3>
                <p>{userData.sobre || "Nenhuma descrição fornecida."}</p>{" "}
                {/* Ajuste 'about' para 'sobre' */}
              </div>
              <div className="profile-section">
                <h3>
                  <MortarboardFill className="icon" /> Educação
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
                  <p>Nenhuma informação educacional fornecida.</p>
                )}
              </div>
              <div className="profile-section">
                <h3>
                  <Briefcase className="icon" /> Experiência Profissional
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
                  <p>Nenhuma experiência profissional fornecida.</p>
                )}
              </div>
              <div className="profile-section">
                <h3>
                  <Globe className="icon" /> Idiomas
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
                  <p>Nenhum idioma fornecido.</p>
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
                {userData.cnpj || "CNPJ não informado"}
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
              </div>
            </div>
          </div>

          <div className="tabs">
            <button
              onClick={() => handleTabChange("sobre")}
              className={activeTab === "sobre" ? "active" : ""}
            >
              Sobre
            </button>
            <button
              onClick={() => handleTabChange("eventos")}
              className={activeTab === "eventos" ? "active" : ""}
            >
              Eventos
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
                        <PersonFill className="icon" /> Sobre
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
                        <Phone className="icon" /> Telefone
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
                      Salvar Alterações
                    </button>
                  </>
                ) : (
                  <>
                    <div className="profile-section">
                      <h3>
                        <PersonFill className="icon" /> Sobre
                      </h3>
                      <p>{userData.sobre || "Nenhuma descrição fornecida."}</p>{" "}
                      {/* Ajuste 'about' para 'sobre' */}
                    </div>
                    <div className="profile-section">
                      <h3>
                        <Globe className="icon" /> Website
                      </h3>
                      <p>{userData.website || "Não informado"}</p>
                    </div>
                    <div className="profile-section">
                      <h3>
                        <Phone className="icon" /> Telefone
                      </h3>
                      <p>{userData.numero_contato || "Não informado"}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "eventos" && (
              <div className="eventos-section">
                <h3>Eventos Promovidos</h3>

                {/* Componente para criar novos posts */}
                <PostForm onPostCreated={handleNewPost} />

                {/* Certifique-se de que os eventos estão sendo renderizados */}
                {userData.events && userData.events.length > 0 ? (
                  userData.events.map((event, index) => (
                    <div key={index} className="event-item">
                      <div className="event-icon">
                        <CalendarFill />
                      </div>
                      <div className="event-details">
                        <h4>{event.descricao || "Sem descrição"}</h4>
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt="Imagem do evento"
                            className="event-image"
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum evento disponível.</p>
                )}
              </div>
            )}

            {activeTab === "badges" && (
              <div className="badges-section">
                <h3>Badges Conquistados</h3>
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
                  <p>Nenhum badge disponível.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
  else {
    return null; // Ou redirecione para o login
  }
};

export default UserProfile;
