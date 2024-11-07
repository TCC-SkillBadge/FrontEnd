import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WorkflowCard from "../components/WorkflowCard";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Workflow.css";

const Workflow = () => {
  const { id_badge } = useParams();
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
  }, []);

  if (userType === "UE") {
    return (
      <div className="workflow-page">
        <Navbar userType={userType} user={user} />
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
        <Footer />
      </div>
    );
  }
  else if (userType === "UA") {
    return (
      <div className="workflow-page">
        <Navbar userType={userType} user={user} />
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
        <Footer />
      </div>
    );
  }
};

export default Workflow;
