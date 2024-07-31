import React from "react";
import Navbar from "../components/Navbar";
import "../styles/Workflow.css";

const Workflow = () => {
  return (
    <div className="workflow-page">
      <Navbar />
      <div className="workflow-container">
        <h1 className="workflow-title">Badge Issuance Workflow</h1>
        <p className="workflow-subtitle">
          Track the progress of your badge request through our streamlined workflow.
        </p>
      </div>
    </div>
  );
};

export default Workflow;
