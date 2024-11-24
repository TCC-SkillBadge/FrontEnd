import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../components/ConfirmationModal"; // Certifique-se de que este componente existe
import "../styles/ConfirmBadge.css"; // Adicione estilos específicos se necessário

const API_BADGES = process.env.REACT_APP_API_BADGES;

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
    // Extrair o token da URL
    const params = new URLSearchParams(location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      // Armazena o token para futura referência
      localStorage.setItem("badgeConfirmationToken", tokenFromURL);
      confirmBadge(tokenFromURL);
    } else {
      const storedToken = localStorage.getItem("badgeConfirmationToken");
      if (storedToken) {
        confirmBadge(storedToken);
      } else {
        toast.error("Token de confirmação inválido ou ausente.");
        navigate("/"); // Redireciona para a página inicial
      }
    }
  }, [location.search, navigate]);

  const confirmBadge = async (confirmationToken) => {
    setIsLoading(true);
    try {
      const storedAuthToken =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (!storedAuthToken) {
        // Caso o usuário não esteja logado, solicita login
        setModalContent({
          title: "Confirmação de Badge",
          body: "Você precisa estar logado para confirmar a badge. Deseja fazer login agora?",
          showButtons: true,
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      // Realiza a confirmação da badge
      const response = await axios.post(
        `${API_BADGES}badges/confirm-badge`,
        { token: confirmationToken },
        {
          headers: {
            Authorization: `Bearer ${storedAuthToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Badge confirmada com sucesso!");
        localStorage.removeItem("badgeConfirmationToken");
        navigate("/profile"); // Redireciona para o perfil do usuário
      }
    } catch (error) {
      console.error("Erro ao confirmar a badge:", error);
      if (error.response && error.response.data) {
        toast.error(
          error.response.data.message || "Erro ao confirmar a badge."
        );
      } else {
        toast.error("Erro ao confirmar a badge. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
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
    navigate("/"); // Redireciona para a página inicial
  };

  const handleConfirmAction = () => {
    if (modalContent.body.includes("login")) {
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
          <p>Confirmando sua badge...</p>
        </div>
      ) : (
        <ConfirmationModal
          show={showModal}
          onHide={handleCloseModal}
          onConfirm={handleConfirmAction}
          title={modalContent.title}
          body={modalContent.body}
          confirmButtonText="Sim"
          cancelButtonText="Cancelar"
          showButtons={modalContent.showButtons}
        />
      )}
    </div>
  );
};

export default ConfirmBadge;
