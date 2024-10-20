import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  GeoAlt,
  Briefcase,
  Globe,
  PersonFill,
  AwardFill,
  PeopleFill,
} from "react-bootstrap-icons";
import "../styles/PublicProfileEnterprise.css";
import { toast } from "react-toastify";
import NavBar from "../components/Navbar";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaShareAlt,
} from "react-icons/fa";

const PublicProfileEnterprise = () => {
  const { encodedEmail } = useParams();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("sobre");
  const [loading, setLoading] = useState(true);

  // Estado para controlar as opções de compartilhamento
  const [showShareOptions, setShowShareOptions] = useState({});

  // Para obter eventId dos parâmetros da URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventIdFromUrl = queryParams.get("eventId");
  const [highlightedEventId, setHighlightedEventId] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7003/api/public-profile/${encodedEmail}`
        );
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar o perfil público:", error);
        toast.error("Erro ao carregar o perfil público.");
        setLoading(false);
      }
    };

    if (encodedEmail) {
      fetchUserProfile();
    }
  }, [encodedEmail]);

  useEffect(() => {
    if (eventIdFromUrl) {
      setHighlightedEventId(eventIdFromUrl);
    }
  }, [eventIdFromUrl]);

  // Fechar as opções de compartilhamento ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".event-share") &&
        Object.values(showShareOptions).some((value) => value)
      ) {
        setShowShareOptions({});
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showShareOptions]);

  const handleShareEvent = (event, platform) => {
    const encodedEmailParam = encodedEmail;
    const eventId = event.id;
    const eventUrl = `${window.location.origin}/public-profile-enterprise/${encodedEmailParam}?eventId=${eventId}`;

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          eventUrl
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          eventUrl
        )}&text=${encodeURIComponent(event.descricao)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          eventUrl
        )}`;
        break;
      default:
        break;
    }

    window.open(shareUrl, "_blank");
  };

  // Função para formatar a data e hora
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

  if (loading) {
    return <div className="spinner-container">Carregando...</div>;
  }

  if (!userData) {
    return (
      <div className="public-profile-container">Usuário não encontrado.</div>
    );
  }

  return (
    <div className="profile-page">
      <NavBar />
      <div className="public-profile-container">
        <div className="profile-header">
          <img
            src={userData.imageUrl || "/default-company-logo.png"}
            alt="Company Logo"
            className="profile-photo"
          />
          <div className="profile-info">
            <h2 className="profile-name">{userData.razao_social}</h2>
            <p className="profile-title">{userData.cnpj}</p>
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
              {userData.website && (
                <span className="company-badge">
                  <Globe />{" "}
                  <a
                    href={userData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website
                  </a>
                </span>
              )}
              {userData.numero_contato && (
                <span className="company-badge">
                  <PersonFill /> {userData.numero_contato}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Guias */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab("sobre")}
            className={activeTab === "sobre" ? "active" : ""}
          >
            Sobre
          </button>
          <button
            onClick={() => setActiveTab("eventos")}
            className={activeTab === "eventos" ? "active" : ""}
          >
            Eventos
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={activeTab === "badges" ? "active" : ""}
          >
            Badges
          </button>
        </div>

        {/* Conteúdo das Guias */}
        <div className="tab-content">
          {activeTab === "sobre" && (
            <div className="profile-section">
              <h3>
                <PersonFill className="icon" /> Sobre
              </h3>
              <p>{userData.sobre || "Nenhuma descrição fornecida."}</p>
            </div>
          )}

          {activeTab === "eventos" && (
            <div className="profile-section">
              <h3>Eventos Promovidos</h3>
              {userData.events && userData.events.length > 0 ? (
                userData.events.map((event, index) => (
                  <div
                    key={index}
                    className={`event-item ${
                      highlightedEventId === event.id ? "highlighted" : ""
                    }`}
                  >
                    <div className="event-header">
                      <img
                        src={userData.imageUrl || "/default-company-logo.png"}
                        alt="Company Logo"
                        className="event-user-avatar"
                      />
                      <span className="event-user-name">
                        {userData.razao_social}
                      </span>
                      {event.createdAt && (
                        <span className="event-publication-time">
                          {formatDateTime(event.createdAt)}
                        </span>
                      )}
                      <div className="event-options">
                        {/* Botão de Compartilhamento */}
                        <div className="event-share">
                          <FaShareAlt
                            className="share-icon"
                            onClick={() =>
                              setShowShareOptions((prevState) => ({
                                ...prevState,
                                [event.id]: !prevState[event.id],
                              }))
                            }
                            title="Compartilhar Evento"
                          />
                          {/* Opções de compartilhamento */}
                          {showShareOptions[event.id] && (
                            <div className="share-options">
                              <button
                                className="facebook-button"
                                onClick={() =>
                                  handleShareEvent(event, "facebook")
                                }
                              >
                                <FaFacebookF /> Facebook
                              </button>
                              <button
                                className="twitter-button"
                                onClick={() =>
                                  handleShareEvent(event, "twitter")
                                }
                              >
                                <FaTwitter /> Twitter
                              </button>
                              <button
                                className="linkedin-button"
                                onClick={() =>
                                  handleShareEvent(event, "linkedin")
                                }
                              >
                                <FaLinkedinIn /> LinkedIn
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="event-details">
                      <p>{event.descricao || "Sem descrição"}</p>
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt="Imagem do Evento"
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
              <h3>Badges</h3>
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
};

export default PublicProfileEnterprise;
