import React from "react";
import "../styles/WorkflowCard.css";

const WorkflowCard = ({ icon, title, children }) => {
  return (
    <div className="workflow-card">
      <i className={`workflow-icon ${icon}`} alt={title} ></i>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
};

export default WorkflowCard;
