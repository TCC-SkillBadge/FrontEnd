import React, { useState, useEffect } from "react";
import WorkflowCard from "../components/WorkflowCard";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "../styles/Workflow.css";
import ConfirmationModal from "../components/ConfirmationModal";
import ApproveModal from "../components/ApproveModal";
import FeedbackModal from "../components/ConfirmationModal";
import RequestModal from "../components/ConfirmationModal";
import { ShieldFill, JournalText, ExclamationTriangleFill, EyeFill } from "react-bootstrap-icons";

const Workflow = () => {
  const { id_request } = useParams();
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [request, setRequest] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [image_badge, setImageBadge] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const navigate = useNavigate();

  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;
  const adminUrl = process.env.REACT_APP_API_ADMIN;

  const fetchRequest = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await axios.get(
        `${adminUrl}/admin/request`,
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
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching the badge:', error);
    }
  };

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
    fetchRequest();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageBadge(file);
    } else {
      setImageBadge(null);
    }
  };

  const handleAdvance = async (e) => {
    e.preventDefault();
    const loadingToastId = toast.loading("Loading...");
    const token = sessionStorage.getItem("token");

    try {
      let response = await axios.put(`${adminUrl}/admin/workflow-advance`, {
        id_request: request.id_request,
        email_admin: user.email_admin,
        email_enterprise: user.email_comercial,
        image_badge: image_badge
      }, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.dismiss(loadingToastId);

      if (response.status === 200) {
        handleCloseModal();
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

    if (rejectionReason === '') {
      toast.dismiss(loadingToastId);
      toast.error("Please fill in the rejection reason field");
      return;
    }

    try {
      let response = await axios.put(`${adminUrl}/admin/workflow-retreat`, {
        id_request: request.id_request,
        email_enterprise: user.email_comercial,
        desc_feedback: rejectionReason
      });

      toast.dismiss(loadingToastId);

      if (response.status === 200) {
        handleCloseModal();
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

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowFeedbackModal = () => {
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

  const handleShowRequestModal = () => {
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
  };

  const handleConfirm = async (e) => {
    if (image_badge) {
      handleCloseModal();
      handleAdvance(e);
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
              {...request.status === "Requested" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-fan fs-1"
              title="In production"
              children="Your badge is being manufactured."
              {...request.status === "In production" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-eye fs-1"
              title="Review"
              children="Your badge is for your review."
              {...request.status === "Review" ? { active: "-active" } : { active: "" }}
              onClick={handleShowModal}
            />
            <WorkflowCard
              icon="bi bi-check2 fs-1"
              title="Issued"
              children="Your badge has been issued."
              {...request.status === "Issued" ? { active: "-active" } : { active: "" }}
            />
          </div>
        </div>
        <ApproveModal
          show={showModal}
          onHide={handleCloseModal}
          onApprove={handleAdvance}
          onReprove={handleRetreat}
          title="Review Badge"
          body={
            <div>
              <div key={request.id_badge} className="workflow-badge-card default-border-image">
                <img
                  src={request.image_url}
                  className="workflow-badge-preview"
                />
                <h3>{request.name_badge}</h3>
              </div>
              <br />
              <div className="workflow-form-group">
                <label className="workflow-form-label">Rejection Reason</label>
                <div className="workflow-input-icon">
                  <JournalText />
                  <textarea
                    className="form-control"
                    placeholder="Provide a reason for rejection"
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          }
          approveButtonText="Approve"
          reproveButtonText="Reprove"
        />
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
                <button className="button-card" onClick={handleAdvance}>Move to Production</button>
              }
              {...request.status === "Requested" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-power fs-1"
              title="In production"
              children="The badge is currently being production."
              button={
                <button className="button-card" onClick={handleShowModal}>Move to Analysist</button>
              }
              {...request.status === "In production" ? { active: "-active" } : { active: "" }}
              warningIcon={
                request.status === "In production" && request.feedbacks.length > 0 ?
                  <ExclamationTriangleFill
                    className="warning-icon"
                    onClick={handleShowFeedbackModal}
                  />
                  :
                  ""
              }
              viewIcon={
                request.status === "In production" ?
                  <EyeFill
                    className="eye-icon"
                    onClick={handleShowRequestModal}
                  />
                  :
                  ""
              }
            />
            <WorkflowCard
              icon="bi bi-eye fs-1"
              title="Analysis"
              children="The badge is being reviewed for quality and accuracy."
              {...request.status === "Review" ? { active: "-active" } : { active: "" }}
            />
            <WorkflowCard
              icon="bi bi-award fs-1"
              title="Issued"
              children="The badge has been successfully issued."
              {...request.status === "Issued" ? { active: "-active" } : { active: "" }}
            />
          </div>
        </div>
        <RequestModal
          show={showRequestModal}
          showButtons={false}
          onHide={handleCloseRequestModal}
          title="Request Details"
          body={
            <div className="workflow-request-details">
              <h4>Colors</h4>
              <ul>
                {request.color_badge ?
                  request.color_badge.split(';').map((color, index) => (
                    <li key={index}>{color}</li>
                  ))
                  :
                  <li>No colors available</li>
                }
              </ul>
              <br />

              <h4>Badge shape</h4>
              {/* <img src={`../assets/badge-models/`+ request.shape_badge} className="badge-shape-image" />*/}
              <p>{request.shape_badge}</p>
              <br />

              <h4>Request description</h4>
              <p>{request.desc_request}</p>
            </div >
          }
          confirmButtonText="Close"
        />
        <FeedbackModal
          show={showFeedbackModal}
          showButtons={false}
          onHide={handleCloseFeedbackModal}
          title="Rejection Feedback"
          body={
            <div>
              {Array.isArray(request.feedbacks) && request.feedbacks.length > 0 ? (
                request.feedbacks.map((feedback) => (
                  <div key={feedback.id_feedback} className="workflow-feedback-item">
                    <p><strong>Date: </strong>{new Date(feedback.date).toLocaleString()}</p>
                    <p><strong>Reason: </strong> {feedback.desc_feedback}</p>
                    <br />
                  </div>
                ))
              ) : (
                <p>No feedback available</p>
              )}
            </div >
          }
          confirmButtonText="Close"
        />
        <ConfirmationModal
          show={showModal}
          onHide={handleCloseModal}
          onConfirm={handleConfirm}
          title="Send to Analysis"
          body={
            <div className="workflow-input-icon">
              <ShieldFill />
              <label htmlFor="image_badge" className="custom-file-upload">
                Choose File
              </label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                id="image_badge"
                onChange={handleImageChange}
                required
              />
            </div>
          }
          confirmButtonText="Confirm"
          cancelButtonText="Cancel"
        />
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
