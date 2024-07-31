import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
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

  return (
    <div className="workflow-page">
      <Navbar userType={userType} user={user}/>
      <div className="workflow-container">
        <h1 className="workflow-title">Badge Issuance Workflow</h1>
        <p className="workflow-subtitle">
          Track the progress of your badge request through our streamlined workflow.
        </p>
        <div className="row workflow-section">
          <WorkflowCard icon="bi bi-journal-check fs-1" title="Requested">
            Your badge request has been submitted.
          </WorkflowCard>
          <WorkflowCard icon="bi bi-fan fs-1" title="In production">
            Your badge is being manufactured.
          </WorkflowCard>
          <WorkflowCard icon="bi bi-eye fs-1" title="Review">
            Your badge is being reviewed.
          </WorkflowCard>
          <WorkflowCard icon="bi bi-check2 fs-1" title="Issued">
            Your badge has been issued.
          </WorkflowCard>
        </div>
      </div>
    </div>
  );
};

export default Workflow;
