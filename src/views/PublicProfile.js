// src/components/PublicProfile.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
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
  CameraFill,
} from "react-bootstrap-icons"; // Importando os ícones
import "../styles/PublicProfile.css";
import "../styles/GlobalStylings.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScaleLoader from "react-spinners/ScaleLoader"; // Importando o spinner

const PublicProfile = () => {
  const { encodedEmail } = useParams(); // Captura o parâmetro encodedEmail da URL
  const [userData, setUserData] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null); // Armazena o tipo de usuário
  const [activeTab, setActiveTab] = useState("perfil"); // Será ajustado após carregar os dados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/api/public-profile/${encodedEmail}`
        );
        const data = response.data;

        // Determinar o tipo de usuário
        let tipo;
        if (data.razao_social) {
          tipo = "UE"; // Usuário Empresarial
        } else {
          tipo = "UC"; // Usuário Comum
        }
        setTipoUsuario(tipo);

        // Ajustar a guia ativa com base no tipo de usuário
        if (tipo === "UC") {
          setActiveTab("perfil");
        } else if (tipo === "UE") {
          setActiveTab("sobre");
        }

        // Mapear os dados corretamente
        setUserData({
          ...data,
          education: Array.isArray(data.education) ? data.education : [],
          professionalExperience: Array.isArray(data.professional_experience)
            ? data.professional_experience
            : [],
          languages: Array.isArray(data.languages) ? data.languages : [],
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar perfil público:", error);
        setError("Falha ao carregar o perfil do usuário.");
        setLoading(false);
      }
    };

    if (encodedEmail) {
      fetchUserProfile();
    } else {
      setError("URL de perfil inválida.");
      setLoading(false);
    }
  }, [encodedEmail]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Função para fechar o dropdown ao clicar fora
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
  }, [languageDropdownRef]);

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen((prevState) => !prevState);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <ScaleLoader color="#00BFFF" loading={loading} size={150} />
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!userData) {
    return (
      <div className="error-container">Dados do usuário não disponíveis.</div>
    );
  }

  return (
    <div className="profile-page">
      <ToastContainer />
      <div className="profile-container default-border-image">
        {/* Cabeçalho do Perfil */}
        <div className="profile-header">
          <div className="profile-photo-wrapper">
            <img
              src={
                userData.imageUrl ||
                (tipoUsuario === "UC"
                  ? "/default-avatar.png"
                  : "/default-company-logo.png")
              }
              alt={tipoUsuario === "UC" ? "User Avatar" : "Company Logo"}
              className="profile-photo"
            />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">
              {tipoUsuario === "UC" ? userData.fullName : userData.razao_social}
            </h2>
            <p className="profile-title">
              {tipoUsuario === "UC"
                ? userData.occupation || "Ocupação não informada"
                : userData.cnpj || "CNPJ não fornecido"}
            </p>
            {/* Se for UE, exibir badges de município, segmento, etc. */}
            {tipoUsuario === "UE" && (
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
            )}
          </div>
        </div>

        {/* Guias */}
        <div className="tabs">
          {tipoUsuario === "UC" ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Conteúdo das Guias */}
        <div className="tab-content">
          {/* Guia Perfil para UC */}
          {tipoUsuario === "UC" && activeTab === "perfil" && (
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
                        <span className="profile-info-text">{exp.company}</span>
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
                <p>
                  {userData.languages.length > 0
                    ? userData.languages.map((lang) => lang.name).join(", ")
                    : "Nenhum idioma selecionado."}
                </p>
              </div>
            </div>
          )}

          {/* Guia Badges para UC e UE */}
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

          {/* Guia Sobre para UE */}
          {tipoUsuario === "UE" && activeTab === "sobre" && (
            <div className="sobre-section">
              <div className="profile-section">
                <h3>
                  <PersonFill className="icon" /> Sobre
                </h3>
                <p>{userData.sobre || "Nenhuma descrição fornecida."}</p>
              </div>

              <div className="profile-section">
                <h3>
                  <Globe className="icon" /> Website
                </h3>
                <p>
                  {userData.website ? (
                    <a
                      href={userData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {userData.website}
                    </a>
                  ) : (
                    "Não fornecido"
                  )}
                </p>
              </div>

              <div className="profile-section">
                <h3>
                  <Phone className="icon" /> Telefone
                </h3>
                <p>{userData.numero_contato || "Não fornecido"}</p>
              </div>
            </div>
          )}

          {/* Guia Eventos para UE */}
          {tipoUsuario === "UE" && activeTab === "eventos" && (
            <div className="eventos-section">
              <h3>Eventos Promovidos</h3>
              {userData.events && userData.events.length > 0 ? (
                userData.events.map((event, index) => (
                  <div key={index} className="event-item">
                    <div className="event-header">
                      <img
                        src={event.imageUrl || "/default-company-logo.png"}
                        alt="Company Logo"
                        className="event-user-avatar"
                      />
                      <span className="event-user-name">
                        {userData.razao_social || "Empresa"}
                      </span>

                      {/* Exibição da Data e Hora de Publicação */}
                      {event.createdAt && (
                        <span className="event-publication-time">
                          {new Date(event.createdAt).toLocaleString("pt-BR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <div className="event-details">
                      <p>{event.descricao || "Nenhuma descrição."}</p>
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
                <p>Nenhum evento disponível.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
