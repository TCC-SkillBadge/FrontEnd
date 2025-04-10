import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/WorkflowCard.css";

const WorkflowCard = ({ icon, title, children, button, active, onClick, warningIcon, viewIcon }) => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;
  const adminUrl = process.env.REACT_APP_API_ADMIN;

  const checkLogin = async () => {
    const token = sessionStorage.getItem("token");
    const userType = sessionStorage.getItem("tipoUsuario");

    if (userType === "UE") {
      let userInfoResponse = await axios.get(
        `${enterpriseUrl}/api/acessar-info-usuario-jwt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserType("UE");
      setUser(userInfoResponse.data);
    }
    else if (userType === "UA") {
      let userInfoResponse = await axios.get(
        `${adminUrl}/admin/acessa-info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserType("UA");
      setUser(userInfoResponse.data);
    }
    else {
      navigate("/home")
    }
  };

  useEffect(() => {
    checkLogin();
    window.onstorage = checkLogin;
  }, []);

  if (userType === "UE") {
    return (
      <div className={`workflow-card${active} default-border-image`} onClick={onClick}>
        <i className={`workflow-icon ${icon}`} alt={title} ></i>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    );
  }
  else if (userType === "UA") {
    return (
      <div className={`workflow-card-adm${active} default-border-image`}>
        <div className="row">
          <div className="col-sm-1">
            <i className={`workflow-icon-adm ${icon}`} alt={title} ></i>
          </div>
          <div className="col-sm-9">
            <h3>{title}</h3>
            <p>{children}</p>
            {warningIcon && (
              <div className="warning-icon-container">
                {warningIcon}
              </div>
            )}
            {viewIcon && (
              <div className="eye-icon-container">
                {viewIcon}
              </div>
            )}
            {button}
          </div>
        </div>
      </div>
    );
  }
};

export default WorkflowCard;
