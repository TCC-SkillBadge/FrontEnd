import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  GeoAlt,
  Briefcase,
  PeopleFill,
  Globe,
  PersonFill,
  AwardFill,
} from "react-bootstrap-icons";
import "../styles/PublicProfileEnterprise.css";
import { toast } from "react-toastify";

const PublicProfileEnterprise = () => {
  const { encodedEmail } = useParams();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("sobre");
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="spinner-container">Carregando...</div>;
  }

  if (!userData) {
    return <div>Usuário não encontrado.</div>;
  }

  return (
    <div className="profile-page">
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
              {/* Outros badges, se aplicável */}
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
                  <div key={index} className="event-item">
                    <div className="event-header">
                      <img
                        src={userData.imageUrl || "/default-company-logo.png"}
                        alt="Company Logo"
                        className="event-user-avatar"
                      />
                      <span className="event-user-name">
                        {userData.razao_social}
                      </span>
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
