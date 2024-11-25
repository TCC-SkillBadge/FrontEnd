// src/components/BadgeDetails.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/BadgeDetails.css";
import "../styles/GlobalStylings.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const BadgeDetails = ({ id_badge, razao_social, url_origem, userType }) => {
  const [badge, setBadge] = useState({
    id_badge: 0,
    name_badge: "",
    desc_badge: "",
    validity_badge: 0,
    image_url: "",
    institution: "",
    skills_badge: null,
  });

  const [user, setUser] = useState({
    email_comercial: "",
    senha: "",
    razao_social: "",
    cnpj: "",
    cep: "",
    logradouro: "",
    bairro: "",
    municipio: "",
    suplemento: "",
    numero_contato: "",
    api_key: "",
    imageUrl: "",
  });

  const [razSoc, setRazSoc] = useState("");

  const badgeUrl = process.env.REACT_APP_API_BADGE;

  const fetchBadge = async () => {
    try {
      const response = await axios.get(
        `${badgeUrl}/badges/consult?id_badge=${id_badge}`
      );
      setBadge(response.data);
    } catch (error) {
      console.error("Error fetching the badge:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const storedUserInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      setUser(storedUserInfo);
    } catch (error) {
      console.error("Error fetching institution:", error);
    }
  };

  useEffect(() => {
    fetchBadge();
    fetchUser();
  }, [id_badge]);

  useEffect(() => {
    let inst = "Unknown";
    if (user && user.razao_social) {
      inst = user.razao_social;
    } else if (razao_social && razao_social !== "undefined") {
      inst = razao_social;
    }
    setRazSoc(() => inst);
  }, [user, razao_social]);

  return (
    <div className="badge-details-container">
      <div className="row">
        <div className="col-md-4 ">
          <div className="default-border-image">
            <img
              src={badge.image_url}
              className="badge-details-image"
              alt={badge.name_badge}
            />
          </div>
          <br />
          <p className="badge-details-text">By {razSoc}</p>
        </div>
        <div className="col-md-8">
          <div className="badge-details-content">
            <h1 className="badge-details-title">{badge.name_badge}</h1>
            <br />
            <br />

            <h2 className="badge-details-subtitle">Description</h2>
            <br />

            <p className="badge-details-description">{badge.desc_badge}</p>
            <br />

            <h2 className="badge-details-title">Skills</h2>
            <ul className="badge-details-skills-list">
              {badge.skills_badge ? (
                badge.skills_badge.split(";").map((skill, index) => (
                  <li key={index} className="badge-details-skill-tag">
                    {skill.trim()}
                  </li>
                ))
              ) : (
                <li className="badge-details-skill-tag">
                  No skills available
                </li>
              )}
            </ul>
            {url_origem && (
              <Link to={url_origem} className="badge-details-button">
                Back
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeDetails;