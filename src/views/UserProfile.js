// src/components/UserProfile.jsx
import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  ChevronUp,
} from "react-bootstrap-icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/UserProfile.css";
import NavBar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom"; 
import PostForm from "../components/PostForm";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    occupation: "",
    about: "",
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

  const [optionsVisibleIndex, setOptionsVisibleIndex] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);

  const tipoUsuario = sessionStorage.getItem("tipoUsuario");
  const [activeTab, setActiveTab] = useState(
    tipoUsuario === "UC" ? "perfil" : "sobre"
  );
  const handleNewPost = (newPost) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      events: [newPost, ...prevUserData.events],
    }));
  };

  const fetchBadges = async (tipoUsuario, email) => {
  try {
    let response;
    const token = sessionStorage.getItem("token");

    if (tipoUsuario === "UC") {
      // Endpoint para usuários comuns
      response = await axios.get(`http://localhost:7001/badges/wallet?email=${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else if (tipoUsuario === "UE") {
      // Endpoint para usuários empresariais
      response = await axios.get(`http://localhost:7001/badges/consult?search=${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      throw new Error("Tipo de usuário inválido");
    }

    setUserData((prevData) => ({
      ...prevData,
      badges: response.data,
    }));
    setLoading(false);
  } catch (error) {
    console.error("Erro ao buscar badges:", error);
    setUserData((prevData) => ({ ...prevData, badges: [] }));
    setLoading(false);
  }
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
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      // Carregar os idiomas disponíveis primeiro
      const languagesResponse = await axios.get(
        "http://localhost:7000/api/languages",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAvailableLanguages(languagesResponse.data);

      if (tipoUsuario === "UC") {
        response = await axios.get("http://localhost:7000/api/user/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Mapear os idiomas do usuário para objetos com id e name
        const userLanguages = Array.isArray(response.data.languages)
          ? response.data.languages
          : [];

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
          languages: userLanguages,
        });

        // Chamar fetchBadges para usuários comuns
        const email = response.data.email || "teste@email.com";
        await fetchBadges("UC", email);

      } else if (tipoUsuario === "UE") {
        response = await axios.get(
          "http://localhost:7003/api/acessar-info-usuario-jwt",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
          email_comercial: response.data.email_comercial,
          sobre: response.data.sobre || "",
          website: response.data.website || "",
          events: eventsResponse.data || [],
          badges: [], // Inicializa como vazio
        });

        console.log("Loaded events:", eventsResponse.data);

        // Chamar fetchBadges para usuários empresariais
        const email = response.data.email_comercial || "teste_comercial@email.com";
        await fetchBadges("UE", email);

      } else {
        setError("Tipo de usuário inválido");
      }

      setLoading(false);
    } catch (error) {
      console.error("Erro ao obter informações do usuário:", error);
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
    let value = e.target.value;

    // Se o campo for um ano (admissionYear, graduationYear, startDate, endDate)
    if (
      key === "admissionYear" ||
      key === "graduationYear" ||
      key === "startDate" ||
      key === "endDate"
    ) {
      // Remover caracteres não numéricos
      value = value.replace(/[^0-9]/g, "");

      // Limitar o tamanho a 4 dígitos
      if (value.length > 4) {
        value = value.slice(0, 4);
      }
    }

    const updatedArray = [...userData[arrayKey]];
    updatedArray[index][key] = value;
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

  const handleLanguageCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const languageId = parseInt(value);
    const languageObj = availableLanguages.find(
      (lang) => lang.id === languageId
    );

    if (checked) {
      // Adicionar idioma selecionado
      setUserData((prevState) => ({
        ...prevState,
        languages: [
          ...prevState.languages,
          { id: languageObj.id, name: languageObj.language },
        ],
      }));
    } else {
      // Remover idioma desmarcado
      setUserData((prevState) => ({
        ...prevState,
        languages: prevState.languages.filter((lang) => lang.id !== languageId),
      }));
    }
  };

  const handleFileChange = (e) => {
    setUserData({ ...userData, photo: e.target.files[0] });
  };

  const validateDates = () => {
    let isValid = true;

    userData.education.forEach((edu) => {
      if (
        edu.admissionYear &&
        edu.graduationYear &&
        parseInt(edu.admissionYear) > parseInt(edu.graduationYear)
      ) {
        toast.error(
          `Na educação, o ano de início (${edu.admissionYear}) não pode ser maior que o ano de término (${edu.graduationYear}).`
        );
        isValid = false;
      }
    });

    userData.professionalExperience.forEach((exp) => {
      if (
        exp.startDate &&
        exp.endDate &&
        parseInt(exp.startDate) > parseInt(exp.endDate)
      ) {
        toast.error(
          `Na experiência profissional, a data de início (${exp.startDate}) não pode ser maior que a data de término (${exp.endDate}).`
        );
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSaveChanges = async () => {
    if (!validateDates()) {
      return;
    }

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
        formData.append("about", userData.about || "");
        formData.append("education", JSON.stringify(userData.education || []));
        formData.append(
          "professionalExperience",
          JSON.stringify(userData.professionalExperience || [])
        );
        formData.append(
          "languages",
          JSON.stringify(userData.languages.map((lang) => lang.id))
        );

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
        formData.append("sobre", userData.sobre || "");
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
    let encodedEmail;
    let publicProfileUrl;

    if (tipoUsuario === "UC") {
      if (!userData.email) {
        toast.error("Email não disponível.");
        return;
      }
      encodedEmail = btoa(userData.email);
      publicProfileUrl = `${window.location.origin}/public-profile/${encodedEmail}`;
    } else if (tipoUsuario === "UE") {
      if (!userData.email_comercial) {
        toast.error("Email comercial não disponível.");
        return;
      }
      encodedEmail = btoa(userData.email_comercial);
      publicProfileUrl = `${window.location.origin}/public-profile-enterprise/${encodedEmail}`;
    } else {
      toast.error("Tipo de usuário inválido.");
      return;
    }

    navigator.clipboard
      .writeText(publicProfileUrl)
      .then(() => {
        toast.info("URL do perfil copiada para a área de transferência!");
      })
      .catch((error) => {
        console.error("Erro ao copiar o link:", error);
        toast.error("Falha ao copiar o link.");
      });
  };

  const handleDownloadPortfolio = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    let currentY = 50;

    doc.setFontSize(20);
    doc.text("User Portfolio", 40, currentY);
    currentY += 40;

    doc.setFontSize(12);
    doc.text(`Name: ${userData.fullName}`, 40, currentY);
    currentY += 20;
    doc.text(`Occupation: ${userData.occupation}`, 40, currentY);
    currentY += 20;
    doc.text(`About: ${userData.about}`, 40, currentY);
    currentY += 30;

    doc.setFontSize(16);
    doc.text("Education:", 40, currentY);
    currentY += 20;
    userData.education.forEach((edu, index) => {
      doc.setFontSize(12);
      doc.text(
        `${edu.institution}, ${edu.degree}, ${edu.admissionYear} - ${edu.graduationYear}`,
        60,
        currentY
      );
      currentY += 20;
    });

    currentY += 20;
    doc.setFontSize(16);
    doc.text("Professional Experience:", 40, currentY);
    currentY += 20;
    userData.professionalExperience.forEach((exp, index) => {
      doc.setFontSize(12);
      doc.text(
        `${exp.company}, ${exp.position}, ${exp.startDate} - ${exp.endDate}`,
        60,
        currentY
      );
      currentY += 20;
    });

    currentY += 20;
    doc.setFontSize(16);
    doc.text("Languages:", 40, currentY);
    currentY += 20;
    userData.languages.forEach((language, index) => {
      doc.setFontSize(12);
      doc.text(`${language.name}`, 60, currentY);
      currentY += 20;
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

  // Funções relacionadas aos eventos (para o UE)
  const isWithin24Hours = (createdAt) => {
    const eventDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now - eventDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const handleOptionsClick = (index) => {
    setOptionsVisibleIndex(optionsVisibleIndex === index ? null : index);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
  };

  const handleDeleteEvent = async (event) => {
    const confirmDelete = window.confirm(
      "Você realmente deseja excluir este evento?"
    );
    if (!confirmDelete) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`http://localhost:7003/api/eventos/${event.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData((prevUserData) => ({
        ...prevUserData,
        events: prevUserData.events.filter((e) => e.id !== event.id),
      }));
      toast.success("Evento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir o evento:", error);
      toast.error("Falha ao excluir o evento.");
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      events: prevUserData.events.map((event) =>
        event.id === updatedPost.id ? updatedPost : event
      ),
    }));
    setEditingEvent(null);
  };

  // Efeito para fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
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
        {/* Cabeçalho do Perfil */}
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

        {/* Guias de Perfil e Badges */}
        <div className="tabs">
          <button
            onClick={() => handleTabChange("perfil")}
            className={activeTab === "perfil" ? "active" : ""}
          >
            Perfil
          </button>
          <button
            onClick={() => handleTabChange("badges")}
            className={activeTab === "badges" ? "active" : ""}
          >
            Badges
          </button>
        </div>

        {/* Conteúdo das Guias */}
        <div className="tab-content">
          {/* Guia Perfil */}
          {activeTab === "perfil" &&
            (isEditing ? (
              <div className="profile-sections">
                {/* Seção Sobre */}
                <div className="profile-section">
                  <label>
                    <PersonFill className="icon" /> Sobre
                  </label>
                  <textarea
                    name="about"
                    value={userData.about || ""}
                    onChange={handleInputChange}
                    className="profile-about-input"
                  />
                </div>

                {/* Seção Idiomas */}
                <div className="profile-section">
                  <h3>
                    <Globe className="icon" /> Idiomas
                  </h3>
                  <div className="language-dropdown" ref={languageDropdownRef}>
                    <button
                      type="button"
                      className="language-dropdown-button"
                      onClick={toggleLanguageDropdown}
                    >
                      {userData.languages.length > 0
                        ? userData.languages.map((lang) => lang.name).join(", ")
                        : "Selecione os idiomas"}
                      <span className="dropdown-icon">
                        {isLanguageDropdownOpen ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </span>
                    </button>
                    {isLanguageDropdownOpen && (
                      <div className="language-dropdown-content">
                        {availableLanguages.map((language) => (
                          <div key={language.id} className="language-checkbox">
                            <label>
                              <input
                                type="checkbox"
                                value={language.id}
                                checked={userData.languages.some(
                                  (lang) => lang.id === language.id
                                )}
                                onChange={handleLanguageCheckboxChange}
                              />
                              {language.language}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção Educação */}
                <div className="profile-section">
                  <h3>
                    <MortarboardFill className="icon" /> Educação
                  </h3>
                  {userData.education.map((edu, index) => (
                    <div key={index} className="profile-array-item">
                      <Building className="icon" />
                      <input
                        type="text"
                        value={edu.institution || ""}
                        placeholder="Instituição"
                        onChange={(e) =>
                          handleArrayChange(
                            e,
                            index,
                            "institution",
                            "education"
                          )
                        }
                        className="profile-input"
                      />
                      <AwardFill className="icon" />
                      <input
                        type="text"
                        value={edu.degree || ""}
                        placeholder="Grau"
                        onChange={(e) =>
                          handleArrayChange(e, index, "degree", "education")
                        }
                        className="profile-input"
                      />
                      <CalendarFill className="icon" />
                      <input
                        type="text"
                        value={edu.admissionYear || ""}
                        placeholder="Ano de Ingresso"
                        onChange={(e) =>
                          handleArrayChange(
                            e,
                            index,
                            "admissionYear",
                            "education"
                          )
                        }
                        className="profile-input"
                      />
                      <CalendarFill className="icon" />
                      <input
                        type="text"
                        value={edu.graduationYear || ""}
                        placeholder="Ano de Conclusão"
                        onChange={(e) =>
                          handleArrayChange(
                            e,
                            index,
                            "graduationYear",
                            "education"
                          )
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
                        admissionYear: "",
                        graduationYear: "",
                      })
                    }
                    className="add-button"
                  >
                    <PlusSquare /> Adicionar
                  </button>
                </div>

                {/* Seção Experiência Profissional */}
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
                      <CalendarFill className="icon" />
                      <input
                        type="text"
                        value={exp.startDate || ""}
                        placeholder="Ano de Início"
                        onChange={(e) =>
                          handleArrayChange(
                            e,
                            index,
                            "startDate",
                            "professionalExperience"
                          )
                        }
                        className="profile-input"
                      />
                      <CalendarFill className="icon" />
                      <input
                        type="text"
                        value={exp.endDate || ""}
                        placeholder="Ano de Término"
                        onChange={(e) =>
                          handleArrayChange(
                            e,
                            index,
                            "endDate",
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
                        startDate: "",
                        endDate: "",
                      })
                    }
                    className="add-button"
                  >
                    <PlusSquare /> Adicionar
                  </button>
                </div>

                {/* Botão Salvar Alterações */}
                <button onClick={handleSaveChanges} className="save-button">
                  Salvar Alterações
                </button>
              </div>
            ) : (
              <div className="profile-sections">
                {/* Seção Sobre */}
                <div className="profile-section">
                  <h3>
                    <PersonFill className="icon" /> Sobre
                  </h3>
                  <p>{userData.about || "Nenhuma descrição fornecida."}</p>
                </div>

                {/* Seção Educação */}
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
                          <CalendarFill className="icon" />
                          <span className="education-dates">
                            {edu.admissionYear} - {edu.graduationYear}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhuma informação educacional fornecida.</p>
                  )}
                </div>

                {/* Seção Experiência Profissional */}
                <div className="profile-section">
                  <h3>
                    <Briefcase className="icon" /> Experiência Profissional
                  </h3>
                  {Array.isArray(userData.professionalExperience) &&
                  userData.professionalExperience.length > 0 ? (
                    userData.professionalExperience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <div className="profile-info-row">
                          <Building className="icon" />
                          <span className="profile-info-text">
                            {exp.company}
                          </span>
                        </div>
                        <div className="profile-info-row">
                          <Briefcase className="icon" />
                          <span className="profile-info-text">
                            {exp.position}
                          </span>
                        </div>
                        <div className="profile-info-row">
                          <CalendarFill className="icon" />
                          <span className="education-dates">
                            {exp.startDate} - {exp.endDate}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhuma experiência profissional fornecida.</p>
                  )}
                </div>

                {/* Seção Idiomas */}
                <div className="profile-section">
                  <h3>
                    <Globe className="icon" /> Idiomas
                  </h3>
                  {Array.isArray(userData.languages) &&
                  userData.languages.length > 0 ? (
                    userData.languages.map((language, index) => (
                      <div key={index} className="profile-info-row">
                        <Flag className="icon" />
                        <span className="profile-info-text">
                          {language.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum idioma fornecido.</p>
                  )}
                </div>
              </div>
            ))}

          {/* Guia Badges */}
          {activeTab === "badges" && (
            <div className="badges-section">
              <h3>Badges</h3>
              {userData.badges && userData.badges.length > 0 ? (
                <div className="badges-grid">
                  {userData.badges.map((badge) => (
                    <div key={badge.id_badge} className="badge-card">
                      <img
                        src={badge.image_url}
                        alt="Badge"
                        className="badge-preview"
                      />
                      <h4>{badge.name_badge}</h4>
                      <Link to={`/badges/details/${badge.id_badge}`}>
                        <button>Detalhes</button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Nenhuma badge disponível.</p>
              )}
            </div>
          )}
        </div>
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
              <h3>Badges</h3>
              {userData.badges && userData.badges.length > 0 ? (
                <div className="badges-grid">
                  {userData.badges.map((badge) => (
                    <div key={badge.id_badge} className="badge-card">
                      <img
                        src={badge.image_url}
                        alt="Badge"
                        className="badge-preview"
                      />
                      <h3>{badge.name_badge}</h3>
                      <Link to={`/badges/details/${badge.id_badge}`}>
                        <button>Details</button>
                      </Link>
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
