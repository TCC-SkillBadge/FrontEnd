import React, { useState, useEffect } from "react";
import WorkflowCard from "../components/WorkflowCard";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "../styles/Workflow.css";

const Workflow = () => {
  const { id_request } = useParams();
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [request, setRequest] = useState({});

  const navigate = useNavigate();

  const fetchRequest = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:7004/admin/request`,
        {
          params: {
            id_request: id_request,
            token: token,
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequest(response.data);
    } catch (error) {
      console.error('Error fetching the badge:', error);
    }
  };

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
    fetchRequest();
  }, []);

  const handleAdvance = async (e) => {
    e.preventDefault();
    const loadingToastId = toast.loading("Loading...");
    const token = sessionStorage.getItem("token");

    try {
      let response = await axios.put(`http://localhost:7004/admin/workflow-advance`, {
        id_request: request.id_request,
        email_admin: user.email_admin,
        email_enterprise: user.email_comercial
      });

      toast.dismiss(loadingToastId);

      if (response.status === 200) {
        toast.success("Order updated successfully");
        setTimeout(() => {
          fetchRequest();
        }, 2000);   
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Error updating order:", error);
      toast.error("Error updating order");
    }
  };

  const handleRetreat = async (e) => {
    e.preventDefault();
    const loadingToastId = toast.loading("Loading...");
    const token = sessionStorage.getItem("token");

    try {
      let response = await axios.put(`http://localhost:7004/admin/workflow-retreat`, {
        id_request: request.id_request,
        email_enterprise: user.email_comercial
      });

      toast.dismiss(loadingToastId);

      if (response.status === 200) {
        toast.success("Order updated successfully");
        setTimeout(() => {
          fetchRequest();
        }, 2000);   
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Error updating order:", error);
      toast.error("Error updating order");
    }
  };

  if (userType === "UE") {
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
              {...request.status_badge === "Requested" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-fan fs-1"
              title="In production"
              children="Your badge is being manufactured."
              {...request.status_badge === "In production" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-eye fs-1"
              title="Review"
              children="Your badge is for your review."
              {...request.status_badge === "Review" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-check2 fs-1"
              title="Issued"
              children="Your badge has been issued."
              {...request.status_badge === "Issued" ? { active: "-active" } : { active: "" }}
            />
          </div>
        </div>
      </div>
    );
  }
  else if (userType === "UA") {
    return (
      <div className="workflow-page">
        <div className="workflow-container-adm">
          <h1 className="workflow-title-adm">Badge  Workflow  </h1>
          <div className="row workflow-section-adm">
            <WorkflowCard
              icon="bi bi-journal-bookmark-fill fs-1"
              title="Requested"
              children="The badge request has been submitted."
              button={
                <button className="button-card" onClick={handleAdvanceUA}>Move to Production</button>
              }
              {...request.status_badge === "Requested" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-power fs-1"
              title="In production"
              children="The badge is currently being production."
              button={
                <button className="button-card" onClick={handleAdvance}>Move to Analysist</button>
              }
              {...request.status_badge === "In production" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-eye fs-1"
              title="Analysis"
              children="The badge is being reviewed for quality and accuracy."
              {...request.status_badge === "Review" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-award fs-1"
              title="Issued"
              children="The badge has been successfully issued."
              {...request.status_badge === "Issued" ? { active: "-active" } : { active: "" }}
            />
          </div>
        </div>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    );
  }
};

export default Workflow;
