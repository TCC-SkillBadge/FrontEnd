// src/components/UserEventItem.jsx
import React from "react";
import PropTypes from "prop-types";

const UserEventItem = ({
  event,
  isHighlighted,
  formatDateTime,
  userImageUrl, // URL da imagem do usuário
}) => {
  return (
    <div className={`user-event-item ${isHighlighted ? "highlighted" : ""}`}>
      <div className="profile-enterprise-event-header">
        <img
          src={userImageUrl || "/default-company-logo.png"}
          alt="Company Logo"
          className="profile-enterprise-event-user-avatar"
        />
        <span className="profile-enterprise-event-user-name">
          {event.username}
        </span>
        {event.createdAt && (
          <span className="profile-enterprise-event-publication-time">
            {formatDateTime(event.createdAt)}
          </span>
        )}
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
  );
};

// Definição de PropTypes para melhor documentação e validação
UserEventItem.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    descricao: PropTypes.string,
    imageUrl: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  isHighlighted: PropTypes.bool,
  formatDateTime: PropTypes.func.isRequired,
  userImageUrl: PropTypes.string, // URL da imagem do usuário
};

UserEventItem.defaultProps = {
  isHighlighted: false,
  userImageUrl: "/default-company-logo.png", // Valor padrão
};

export default UserEventItem;
