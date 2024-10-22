import React from "react";
import { FaBullseye, FaEye, FaHeart } from 'react-icons/fa';
import "../styles/FeatureCard.css";

const FeatureCard = ({ icon, title, children }) => {
  const renderIcon = () => {
    switch (icon) {
      case "Mission":
        return <FaBullseye className="feature-icon" />;
      case "Vision":
        return <FaEye className="feature-icon" />;
      case "Values":
        return <FaHeart className="feature-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="feature-card">
      {renderIcon()}
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
};

export default FeatureCard;
