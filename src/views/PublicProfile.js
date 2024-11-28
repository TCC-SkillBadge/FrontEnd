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
} from "react-bootstrap-icons"; // Importing icons
import "../styles/PublicProfile.css";
import "../styles/GlobalStylings.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScaleLoader from "react-spinners/ScaleLoader"; // Importing spinner

const PublicProfile = () => {
  const { encodedEmail } = useParams(); // Capture the encodedEmail parameter from the URL
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null); // Store the user type
  const [activeTab, setActiveTab] = useState("profile"); // Will be adjusted after loading data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);

  const commonUrl = process.env.REACT_APP_API_COMUM;
  const badgeUrl = process.env.REACT_APP_API_BADGE;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${commonUrl}/api/public-profile/${encodedEmail}`
        );
        const data = response.data;

        // Determine user type
        let type;
        if (data.razao_social) {
          type = "UE"; // Enterprise User
        } else {
          type = "UC"; // Common User
        }
        setUserType(type);

        // Adjust active tab based on user type
        if (type === "UC") {
          setActiveTab("profile");
        } else if (type === "UE") {
          setActiveTab("about");
        }

        // Map data correctly
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
        console.error("Error fetching public profile:", error);
        setError("Failed to load user profile.");
        setLoading(false);
      }
    };

    if (encodedEmail) {
      fetchUserProfile();
    } else {
      setError("Invalid profile URL.");
      setLoading(false);
    }
  }, [encodedEmail, commonUrl]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Function to close dropdown when clicking outside
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
      <div className="profile-spinner-container">
        <ScaleLoader color="#00BFFF" loading={loading} size={150} />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="profile-error-container">{error}</div>;
  }

  if (!userData) {
    return (
      <div className="profile-error-container">User data not available.</div>
    );
  }

  return (
    <div className="profile-page">
      <ToastContainer />
      <div className="profile-container default-border-image">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-photo-wrapper">
            <img
              src={
                userData.imageUrl ||
                (userType === "UC"
                  ? "/default-avatar.png"
                  : "/default-company-logo.png")
              }
              alt={userType === "UC" ? "User Avatar" : "Company Logo"}
              className="profile-photo"
            />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">
              {userType === "UC" ? userData.fullName : userData.razao_social}
            </h2>
            <p className="profile-title">
              {userType === "UC"
                ? userData.occupation || "Occupation not provided"
                : userData.cnpj || "CNPJ not provided"}
            </p>
            {/* If UE, display badges like municipality, segment, etc. */}
            {userType === "UE" && (
              <div className="profile-company-badges">
                {userData.municipio && (
                  <span className="profile-company-badge">
                    <GeoAlt /> {userData.municipio}
                  </span>
                )}
                {userData.segmento && (
                  <span className="profile-company-badge">
                    <Briefcase /> {userData.segmento}
                  </span>
                )}
                {userData.tamanho && (
                  <span className="profile-company-badge">
                    <PeopleFill /> {userData.tamanho}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {userType === "UC" ? (
            <>
              <button
                onClick={() => handleTabChange("profile")}
                className={activeTab === "profile" ? "active" : ""}
              >
                Profile
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
                onClick={() => handleTabChange("about")}
                className={activeTab === "about" ? "active" : ""}
              >
                About
              </button>
              <button
                onClick={() => handleTabChange("events")}
                className={activeTab === "events" ? "active" : ""}
              >
                Events
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

        {/* Tabs Content */}
        <div className="profile-tab-content">
          {/* Profile Tab for UC */}
          {userType === "UC" && activeTab === "profile" && (
            <div className="profile-sections">
              {/* About Section */}
              <div className="profile-section">
                <h3>
                  <PersonFill className="profile-icon" /> About
                </h3>
                <p>{userData.about || "No description provided."}</p>
              </div>

              {/* Education Section */}
              <div className="profile-section">
                <h3>
                  <MortarboardFill className="profile-icon" /> Education
                </h3>
                {Array.isArray(userData.education) &&
                userData.education.length > 0 ? (
                  userData.education.map((edu, index) => (
                    <div key={index} className="profile-education-item">
                      <div className="profile-info-row">
                        <Building className="profile-icon" />
                        <span className="profile-institution-name">
                          {edu.institution}
                        </span>
                      </div>
                      <div className="profile-info-row">
                        <AwardFill className="profile-icon" />
                        <span className="profile-education-degree">
                          {edu.degree}
                        </span>
                      </div>
                      <div className="profile-info-row">
                        <CalendarFill className="profile-icon" />
                        <span className="profile-education-dates">
                          {edu.admissionYear} -{" "}
                          {edu.graduationYear || "At the moment"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No educational information provided.</p>
                )}
              </div>

              {/* Professional Experience Section */}
              <div className="profile-section">
                <h3>
                  <Briefcase className="profile-icon" /> Professional Experience
                </h3>
                {Array.isArray(userData.professionalExperience) &&
                userData.professionalExperience.length > 0 ? (
                  userData.professionalExperience.map((exp, index) => (
                    <div key={index} className="profile-experience-item">
                      <div className="profile-info-row">
                        <Building className="profile-icon" />
                        <span className="profile-info-text">{exp.company}</span>
                      </div>
                      <div className="profile-info-row">
                        <Briefcase className="profile-icon" />
                        <span className="profile-info-text">
                          {exp.position}
                        </span>
                      </div>
                      <div className="profile-info-row">
                        <CalendarFill className="profile-icon" />
                        <span className="profile-education-dates">
                          {exp.startDate} - {exp.endDate || "At the moment"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No professional experience provided.</p>
                )}
              </div>

              {/* Languages Section */}
              <div className="profile-section">
                <h3>
                  <Globe className="profile-icon" /> Languages
                </h3>
                <p>
                  {userData.languages.length > 0
                    ? userData.languages.map((lang) => lang.name).join(", ")
                    : "No languages selected."}
                </p>
              </div>
            </div>
          )}

          {/* Badges Tab for UC and UE */}
          {activeTab === "badges" && (
            <div className="profile-badges-section">
              <h3>Badges</h3>
              {userData.badges && userData.badges.length > 0 ? (
                <div className="profile-badge-slide">
                  {userData.badges.map((badge) => (
                    <div
                      key={badge.id_badge}
                      className="profile-badge-card default-border-image"
                    >
                      <img
                        src={badge.image_url}
                        alt="Badge"
                        className="profile-badge-preview"
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

          {/* About Tab for UE */}
          {userType === "UE" && activeTab === "about" && (
            <div className="profile-about-section">
              <div className="profile-section">
                <h3>
                  <PersonFill className="profile-icon" /> About
                </h3>
                <p>{userData.sobre || "No description provided."}</p>
              </div>

              <div className="profile-section">
                <h3>
                  <Globe className="profile-icon" /> Website
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
                    "Not provided"
                  )}
                </p>
              </div>

              <div className="profile-section">
                <h3>
                  <Phone className="profile-icon" /> Phone
                </h3>
                <p>{userData.numero_contato || "Not provided"}</p>
              </div>
            </div>
          )}

          {/* Events Tab for UE */}
          {userType === "UE" && activeTab === "events" && (
            <div className="profile-events-section">
              <h3>Promoted Events</h3>
              {userData.events && userData.events.length > 0 ? (
                userData.events.map((event, index) => (
                  <div key={index} className="profile-event-item">
                    <div className="profile-event-header">
                      <img
                        src={event.imageUrl || "/default-company-logo.png"}
                        alt="Company Logo"
                        className="profile-event-user-avatar"
                      />
                      <span className="profile-event-user-name">
                        {userData.razao_social || "Company"}
                      </span>

                      {/* Display Publication Date and Time */}
                      {event.createdAt && (
                        <span className="profile-event-publication-time">
                          {new Date(event.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <div className="profile-event-details">
                      <p>{event.descricao || "No description."}</p>
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt="Event Image"
                          className="profile-event-image"
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
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
