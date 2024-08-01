import React, { useState, useEffect } from "react";
import "../styles/WorkflowCard.css";

const WorkflowCard = ({ icon, title, children, button }) => {
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
      <div className="workflow-card">
        <i className={`workflow-icon ${icon}`} alt={title} ></i>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    );
  } 
  //else if (userType === "admin") {
  else {
    return (
      <div className="workflow-card-adm">
        <div className="row">
          <div className="col-sm-1">
            <i className={`workflow-icon-adm ${icon}`} alt={title} ></i>
          </div>
          <div className="col-sm-9">
            <h3>{title}</h3>
            <p>{children}</p>
            <button className="button-card">
              {button}
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default WorkflowCard;
