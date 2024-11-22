// src/pages/ConfirmBadge.js

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../components/ConfirmationModal"; // Ensure this component exists
import "../styles/ConfirmBadge.css"; // Create this file for styles

const API_BADGES = process.env.REACT_APP_API_BADGES; // Ensure this environment variable is set

const ConfirmBadge = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    body: "",
    showButtons: false,
  });
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  useEffect(() => {
    // Extract the token from the URL
    const params = new URLSearchParams(location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      setToken(tokenFromURL);
      // Save the token in localStorage for later use (after login/signup)
      localStorage.setItem("badgeConfirmationToken", tokenFromURL);
      confirmBadge(tokenFromURL);
    } else {
      // Check if there's a token stored in localStorage
      const storedToken = localStorage.getItem("badgeConfirmationToken");
      if (storedToken) {
        setToken(storedToken);
        confirmBadge(storedToken);
      } else {
        // If no token is present, show an error and redirect
        toast.error("Invalid confirmation token.");
        navigate("/"); // Redirect to the home page or another appropriate page
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const confirmBadge = async (confirmationToken) => {
    setIsLoading(true);
    try {
      // Check if the user is logged in
      const storedAuthToken =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (!storedAuthToken) {
        // User is not logged in, prompt to log in or sign up
        setModalContent({
          title: "Badge Confirmation",
          body: "You need to be logged in to confirm this badge. Would you like to log in now?",
          showButtons: true,
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      // User is logged in, send the token to confirm the badge
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
        // Clear the confirmation token after successful confirmation
        localStorage.removeItem("badgeConfirmationToken");
        setIsLoading(false);
        navigate("/profile"); // Redirect to the user's profile or another appropriate page
      }
    } catch (error) {
      console.error("Error confirming the badge:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Error confirming the badge. Please try again later.");
      }
      setIsLoading(false);
      navigate("/"); // Redirect to an appropriate page
    }
  };

  const handleLoginRedirect = () => {
    setShowModal(false);
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    setShowModal(false);
    navigate("/create");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/"); // Redirect to the home page or another appropriate page
  };

  const handleConfirmAction = () => {
    if (modalContent.body.includes("log in")) {
      handleLoginRedirect();
    } else if (modalContent.body.includes("sign up")) {
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
          confirmButtonText="Confirm"
          cancelButtonText="Cancel"
          showButtons={modalContent.showButtons}
        />
      )}
    </div>
  );
};

export default ConfirmBadge;
