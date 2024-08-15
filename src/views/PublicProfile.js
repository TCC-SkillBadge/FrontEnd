import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  AwardFill,
  Building,
  Briefcase,
  Globe,
  Flag,
  PersonFill,
  MortarboardFill,
} from "react-bootstrap-icons"; // Importando os ícones
import "../styles/PublicProfile.css";

const PublicProfile = () => {
  const { encodedEmail } = useParams(); // Captura o parâmetro encodedEmail da URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/api/public-profile/${encodedEmail}`
        );
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load user profile");
        setLoading(false);
      }
    };

    if (encodedEmail) {
      fetchUserProfile();
    } else {
      setError("Invalid profile URL");
      setLoading(false);
    }
  }, [encodedEmail]);

  if (loading) {
    return <div className="spinner-container">Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <img
            src={userData.photo || "/default-avatar.png"}
            alt="User Avatar"
            className="profile-photo"
          />
          <div className="profile-info">
            <h2 className="profile-name">{userData.fullName}</h2>
            <p className="profile-title">
              {userData.occupation || "Occupation not provided"}
            </p>
          </div>
        </div>
        <div className="profile-section">
          <h3>
            <PersonFill className="icon" /> About
          </h3>
          <p>{userData.about || "No description provided."}</p>
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
                  <span className="institution-name">{edu.institution}</span>
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
            <p>No education details provided.</p>
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
                  <span className="profile-info-text">{exp.position}</span>
                </div>
                <div className="profile-info-row">
                  <span className="education-dates">{exp.dates}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No work experience details provided.</p>
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
    </div>
  );
};

export default PublicProfile;
