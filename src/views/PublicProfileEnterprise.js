// src/components/PublicProfileEnterprise.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import {
  GeoAlt,
  Briefcase,
  Globe,
  PersonFill,
  PeopleFill,
} from "react-bootstrap-icons";
import "../styles/PublicProfileEnterprise.css";
import ScaleLoader from "react-spinners/ScaleLoader";
import { toast, ToastContainer } from "react-toastify";
import UserEventItem from "../components/UserEventItem"; // Ajuste o caminho conforme necessário
import "react-toastify/dist/ReactToastify.css";

const PublicProfileEnterprise = () => {
  const { encodedEmail } = useParams();
  const [userData, setUserData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activeTab, setActiveTab] = useState("sobre");
  const [loading, setLoading] = useState(true);

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
  }, [encodedEmail, enterpriseUrl, badgeUrl]);

  useEffect(() => {
    if (eventIdFromUrl) {
      setHighlightedEventId(eventIdFromUrl);
    }
  }, [eventIdFromUrl]);

  const handleShareEvent = (event) => {
    const encodedEmailParam = encodedEmail;
    const eventId = event.id;
    const eventUrl = `${window.location.origin}/public-profile-enterprise/${encodedEmailParam}?eventId=${eventId}`;

    // URLs de compartilhamento para cada plataforma
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        eventUrl
      )}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        eventUrl
      )}&text=${encodeURIComponent(event.descricao)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        eventUrl
      )}`,
    };

    // Exibir um menu de opções de compartilhamento
    // Neste exemplo, abriremos uma janela para cada plataforma diretamente
    // Você pode implementar um menu mais elaborado conforme necessário

    // Por simplicidade, vamos criar um prompt para selecionar a plataforma
    const platform = prompt(
      "Escolha a plataforma para compartilhar:\n1. Facebook\n2. Twitter\n3. LinkedIn",
      "1"
    );

    switch (platform) {
      case "1":
        window.open(shareUrls.facebook, "_blank");
        break;
      case "2":
        window.open(shareUrls.twitter, "_blank");
        break;
      case "3":
        window.open(shareUrls.linkedin, "_blank");
        break;
      default:
        toast.info("Compartilhamento cancelado.");
        break;
    }
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
      <div className="profile-enterprise-container">
        Usuário não encontrado.
      </div>
    );
  }

  return (
    <div className="profile-enterprise-page">
      <ToastContainer />
      <div className="profile-enterprise-container default-border-image">
        <div className="profile-enterprise-header">
          <img
            src={userData.imageUrl || "/default-company-logo.png"}
            alt="Company Logo"
            className="profile-enterprise-photo"
          />
          <div className="profile-enterprise-info">
            <h2 className="profile-enterprise-name">{userData.username}</h2>
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
                userData.events.map((event) => (
                  <UserEventItem
                    key={event.id} // Use event.id como key para melhor desempenho
                    event={event}
                    isHighlighted={highlightedEventId === event.id}
                    formatDateTime={formatDateTime}
                    handleShareEvent={handleShareEvent}
                    userImageUrl={userData.imageUrl} // Passando a URL da imagem do usuário
                  />
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
                      <Link to={`/badge-public-display/${badge.id_badge}/${userData.razao_social}`}>
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
