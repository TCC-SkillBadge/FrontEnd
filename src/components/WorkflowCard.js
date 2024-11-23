import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/WorkflowCard.css";

const WorkflowCard = ({ icon, title, children, button, active, onClick, warningIcon }) => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const checkLogin = async () => {
    const token = sessionStorage.getItem("token");
    const userType = sessionStorage.getItem("tipoUsuario");

    if (userType === "UE") {
      let userInfoResponse = await axios.get(
        `http://localhost:7003/api/acessar-info-usuario-jwt`,
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
        `http://localhost:7004/admin/acessa-info`,
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
      <div className={`workflow-card${active}`} onClick={onClick}>
        <i className={`workflow-icon ${icon}`} alt={title} ></i>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    );
  }
  else if (userType === "UA") {
    return (
      <div className={`workflow-card-adm${active}`}>
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
            {button}
          </div>
        </div>
      </div>
    );
  }
};

export default WorkflowCard;
