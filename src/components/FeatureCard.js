import React from "react";
import "../styles/FeatureCard.css";

const FeatureCard = ({ icon, title, children }) => {
  return (
    <div className="feature-card">
      <img className="feature-icon" alt={title} src={icon} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
};

export default FeatureCard;
