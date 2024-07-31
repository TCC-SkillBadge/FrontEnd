import React from "react";
import "../styles/WorkflowCard.css";

const WorkflowCard = ({ icon, title, children }) => {
  return (
    <div className="workflow-card">
      <img className="workflow-icon" alt={title} src={icon} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
};

export default WorkflowCard;
