import React, { useState, useEffect } from "react";
import WorkflowCard from "../components/WorkflowCard";
import "../styles/Workflow.css";

const Workflow = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  const verificaLogin = () => {
    const usuarioEmpresarial = sessionStorage.getItem("usuarioEmpresarial");
    const usuarioComum = sessionStorage.getItem("usuarioComum");
    const usuarioAdmin = sessionStorage.getItem("usuarioAdmin");

    if (usuarioEmpresarial) {
      setUserType("business");
      setUser(JSON.parse(usuarioEmpresarial));
    } else if (usuarioComum) {
      setUserType("common");
      setUser(JSON.parse(usuarioComum));
    } else if (usuarioAdmin) {
      setUserType("admin");
      setUser(JSON.parse(usuarioAdmin));
    } else {
      setUserType(null);
      setUser(null);
    }
  };

  useEffect(() => {
    verificaLogin();
    window.onstorage = verificaLogin;
  }, []);

  if (userType === "business") {
    return (
      <div className="workflow-page">
        <div className="workflow-container">
          <h1 className="workflow-title">Badge Issuance Workflow</h1>
          <p className="workflow-subtitle">
            Track the progress of your badge request through our streamlined workflow.
          </p>
          <div className="row workflow-section">
            <WorkflowCard
              icon="bi bi-journal-check fs-1"
              title="Requested"
              children="Your badge request has been submitted."
            />
            <WorkflowCard
              icon="bi bi-fan fs-1"
              title="In production"
              children="Your badge is being manufactured."
            />
            <WorkflowCard
              icon="bi bi-eye fs-1"
              title="Review"
              children="Your badge is being reviewed."
            />
            <WorkflowCard
              icon="bi bi-check2 fs-1"
              title="Issued"
              children="Your badge has been issued."
            />
          </div>
        </div>
      </div>
    );
  }
  //else if (userType === "admin") {
  else {
    return (
      <div className="workflow-page">
        <div className="workflow-container-adm">
          <h1 className="workflow-title-adm">Badge  Workflow  </h1>
          <div className="row workflow-section-adm">
            <WorkflowCard
              icon="bi bi-journal-bookmark-fill fs-1"
              title="Requested"
              children="Your badge request has been submitted."
              button="Move to Production"
            />
            <WorkflowCard
              icon="bi bi-power fs-1"
              title="In production"
              children="Your badge is currently being produced."
              button="Move to Analysist"
            />
            <WorkflowCard
              icon="bi bi-eye fs-1"
              title="Analysis"
              children="Your badge is being reviewed for quality and accuracy."
              button="Move to Issued"
            />
            <WorkflowCard
              icon="bi bi-award fs-1"
              title="Issued"
              children="Your badge has been successfully issued."
              button="End Flow"
            />
          </div>
        </div>
      </div>
    );
  }
};

export default Workflow;
