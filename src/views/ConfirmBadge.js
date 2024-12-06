import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/ConfirmBadge.css";

const API_BADGES = process.env.REACT_APP_API_BADGE;

const ConfirmBadge = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    body: "",
    showButtons: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      localStorage.setItem("badgeConfirmationToken", tokenFromURL);
      confirmBadge(tokenFromURL);
    } else {
      const storedToken = localStorage.getItem("badgeConfirmationToken");
      if (storedToken) {
        confirmBadge(storedToken);
      } else {
        toast.error("Invalid or missing confirmation token.");
        navigate("/");
      }
    }
  }, [location.search, navigate]);

  const confirmBadge = async (confirmationToken) => {
    setIsLoading(true);
    try {
      const storedAuthToken =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (!storedAuthToken) {
        setModalContent({
          title: "Badge Confirmation",
          body: "You need to login to confirm the badge. Would you like to login now?",
          showButtons: true,
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BADGES}/badges/confirm-badge`,
        { token: confirmationToken },
        {
          headers: {
            Authorization: `Bearer ${storedAuthToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Badge successfully confirmed!");
        localStorage.removeItem("badgeConfirmationToken");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error confirming the badge:", error);
      if (error.response && error.response.data) {
        toast.error(
          error.response.data.message || "Error confirming the badge."
        );
      } else {
        toast.error("Error confirming the badge. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    console.log("handleLoginRedirect foi chamado");
    setShowModal(false);
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    console.log("handleSignupRedirect foi chamado");
    setShowModal(false);
    navigate("/create");
  };

  const handleCloseModal = () => {
    console.log("handleCloseModal foi chamado");
    setShowModal(false);
    navigate("/");
  };

  const handleConfirmAction = () => {
    console.log("handleConfirmAction foi chamado");
    if (modalContent.body.toLowerCase().includes("login")) {
      console.log("Condição 'login' satisfeita");
      handleLoginRedirect();
    } else if (modalContent.body.toLowerCase().includes("sign up")) {
      console.log("Condição 'sign up' satisfeita");
      handleSignupRedirect();
    }
  };

  return (
    <div className="confirm-badge-container">
      <ToastContainer />
      {isLoading ? (
        <div className="loading-spinner">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Confirming your badge...</p>
        </div>
      ) : (
        <ConfirmationModal
          show={showModal}
          onHide={handleCloseModal}
          onConfirm={handleConfirmAction}
          title={modalContent.title}
          body={modalContent.body}
          confirmButtonText="Yes"
          cancelButtonText="Cancel"
          showButtons={modalContent.showButtons}
        />
      )}
    </div>
  );
};

export default ConfirmBadge;
