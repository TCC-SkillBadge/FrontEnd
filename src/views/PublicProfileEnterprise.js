import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import {
  GeoAlt,
  Briefcase,
  Globe,
  PersonFill,
  AwardFill,
  PeopleFill,
} from "react-bootstrap-icons";
// import { Spinner } from "react-bootstrap"; // Importando o Spinner
import "../styles/PublicProfileEnterprise.css";
import ScaleLoader from "react-spinners/ScaleLoader";
import { toast } from "react-toastify";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaShareAlt,
} from "react-icons/fa";

const PublicProfileEnterprise = () => {
  const { encodedEmail } = useParams();
  const [userData, setUserData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activeTab, setActiveTab] = useState("sobre");
  const [loading, setLoading] = useState(true);

  // Estado para controlar as opções de compartilhamento
  const [showShareOptions, setShowShareOptions] = useState({});

  // Para obter eventId dos parâmetros da URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventIdFromUrl = queryParams.get("eventId");
  const [highlightedEventId, setHighlightedEventId] = useState(null);

  const badgeUrl = process.env.REACT_APP_API_BADGE;
  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${enterpriseUrl}/api/public-profile/${encodedEmail}`
        );
        setUserData(response.data);

        // Supondo que a resposta tenha o email comercial
        const emailComercial =
          response.data.email_comercial || "tgempresarial2@gmail.com";
        await fetchBadges("UE", emailComercial);

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar o perfil público:", error);
        toast.error("Erro ao carregar o perfil público.");
        setLoading(false);
      }
    };

    const fetchBadges = async (tipoUsuario, email) => {
      try {
        let response;
        const token = sessionStorage.getItem("token"); // Verifique se precisa de token para a API pública

        if (tipoUsuario === "UC") {
          // Endpoint para usuários comuns
          response = await axios.get(
            `${badgeUrl}/badges/wallet?email=${email}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else if (tipoUsuario === "UE") {
          // Endpoint para usuários empresariais
          response = await axios.get(
            `${badgeUrl}/badges/consult?search=${email}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          throw new Error("Tipo de usuário inválido");
        }

        setBadges(response.data);
      } catch (error) {
        console.error("Erro ao buscar badges:", error);
        setBadges([]);
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
    return date.toLocaleString("en-US", options);
  };

  if (loading) {
    return (
      <div className="profile-enterprise-spinner-container">
        <ScaleLoader color="#00BFFF" loading={loading} size={150} />
        <p>Carregando...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-enterprise-container">Usuário não encontrado.</div>
    );
  }

  return (
    <div className="profile-enterprise-page">
      <div className="profile-enterprise-container default-border-image">
        <div className="profile-enterprise-header">
          <img
            src={userData.imageUrl || "/default-company-logo.png"}
            alt="Company Logo"
            className="profile-enterprise-photo"
          />
          <div className="profile-enterprise-info">
            <h2 className="profile-enterprise-name">{userData.username}</h2>
            {/* <p className="profile-title">{userData.cnpj}</p> */}
            <div className="profile-enterprise-company-badges">
              {userData.municipio && (
                <span className="profile-enterprise-company-badge">
                  <GeoAlt /> {userData.municipio}
                </span>
              )}
              {userData.segmento && (
                <span className="profile-enterprise-company-badge">
                  <Briefcase /> {userData.segmento}
                </span>
              )}
              {userData.tamanho && (
                <span className="profile-enterprise-company-badge">
                  <PeopleFill /> {userData.tamanho}
                </span>
              )}
              {userData.website && (
                <span className="profile-enterprise-company-badge">
                  <Globe />{" "}
                  <a
                    href={
                      userData.website.startsWith("http://") ||
                        userData.website.startsWith("https://")
                        ? userData.website
                        : `https://${userData.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website
                  </a>
                </span>
              )}
              {userData.numero_contato && (
                <span className="profile-enterprise-company-badge">
                  <PersonFill /> {userData.numero_contato}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Guias */}
        <div className="profile-enterprise-tabs">
          <button
            onClick={() => setActiveTab("sobre")}
            className={activeTab === "sobre" ? "active" : ""}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab("eventos")}
            className={activeTab === "eventos" ? "active" : ""}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={activeTab === "badges" ? "active" : ""}
          >
            Badges
          </button>
        </div>

        {/* Conteúdo das Guias */}
        <div className="profile-enterprise-tab-content">
          {activeTab === "sobre" && (
            <div className="profile-enterprise-section">
              <h3>
                <PersonFill className="profile-enterprise-icon" /> About
              </h3>
              <p>{userData.sobre || "No description provided."}</p>
            </div>
          )}

          {activeTab === "eventos" && (
            <div className="profile-enterprise-section">
              <h3>Promoted Events</h3>
              {userData.events && userData.events.length > 0 ? (
                userData.events.map((event, index) => (
                  <div
                    key={index}
                    className={`event-item ${highlightedEventId === event.id ? "highlighted" : ""
                      }`}
                  >
                    <div className="profile-enterprise-event-header">
                      <img
                        src={userData.imageUrl || "/default-company-logo.png"}
                        alt="Company Logo"
                        className="profile-enterprise-event-user-avatar"
                      />
                      <span className="profile-enterprise-event-user-name">
                        {userData.username}
                      </span>
                      {event.createdAt && (
                        <span className="profile-enterprise-event-publication-time">
                          {formatDateTime(event.createdAt)}
                        </span>
                      )}
                      <div className="profile-enterprise-event-options">
                        {/* Botão de Compartilhamento */}
                        <div className="profile-enterprise-event-share">
                          <FaShareAlt
                            className="profile-enterprise-share-icon"
                            onClick={() =>
                              setShowShareOptions((prevState) => ({
                                ...prevState,
                                [event.id]: !prevState[event.id],
                              }))
                            }
                            title="Share Event"
                          />
                          {/* Opções de compartilhamento */}
                          {showShareOptions[event.id] && (
                            <div className="profile-enterprise-share-options">
                              <button
                                className="profile-enterprise-facebook-button"
                                onClick={() =>
                                  handleShareEvent(event, "facebook")
                                }
                              >
                                <FaFacebookF /> Facebook
                              </button>
                              <button
                                className="profile-enterprise-twitter-button"
                                onClick={() =>
                                  handleShareEvent(event, "twitter")
                                }
                              >
                                <FaTwitter /> Twitter
                              </button>
                              <button
                                className="profile-enterprise-linkedin-button"
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
                    <div className="profile-enterprise-event-details">
                      <p>{event.descricao || "No description"}</p>
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt="Event Image"
                          className="profile-enterprise-event-image"
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
            <div className="profile-enterprise-badges-section">
              <h3>Badges</h3>
              {badges && badges.length > 0 ? (
                <div className="profile-enterprise-badge-slide">
                  {badges.map((badge) => (
                    <div
                      key={badge.id_badge}
                      className="profile-enterprise-badge-card default-border-image"
                    >
                      <img
                        src={badge.image_url}
                        alt={badge.name_badge}
                        className="profile-enterprise-badge-preview"
                      />
                      <h3>{badge.name_badge}</h3>
                      <Link to={`/badges/details/${badge.id_badge}`}>
                        <button>Details</button>
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
};

export default PublicProfileEnterprise;
