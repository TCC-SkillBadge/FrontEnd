import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  GeoAlt,
  Briefcase,
  PeopleFill,
  Globe,
  PersonFill,
} from "react-bootstrap-icons";
import "../styles/PublicProfileEnterprise.css";
import { toast } from "react-toastify";

const PublicProfileEnterprise = () => {
  const { encodedEmail } = useParams();
  const [userData, setUserData] = useState(null);
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
    <div className="public-profile-page">
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
              {/* Descomente se 'segmento' existir no seu modelo
              {userData.segmento && (
                <span className="company-badge">
                  <Briefcase /> {userData.segmento}
                </span>
              )}
              */}
              {/* Descomente se 'tamanho' existir no seu modelo
              {userData.tamanho && (
                <span className="company-badge">
                  <PeopleFill /> {userData.tamanho}
                </span>
              )}
              */}
            </div>
          </div>
        </div>

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
              "Não informado"
            )}
          </p>
        </div>

        <div className="profile-section">
          <h3>Eventos Promovidos</h3>
          {userData.events && userData.events.length > 0 ? (
            userData.events.map((event, index) => (
              <div key={index} className="event-item">
                <p>{event.descricao}</p>
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt="Imagem do Evento"
                    className="event-image"
                  />
                )}
              </div>
            ))
          ) : (
            <p>Nenhum evento disponível.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfileEnterprise;
