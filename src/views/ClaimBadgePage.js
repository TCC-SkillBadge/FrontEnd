import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ClaimBadgePage.css"; // Certifique-se de criar este arquivo de estilo

const ClaimBadgePage = () => {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [badgeDetails, setBadgeDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = sessionStorage.getItem("userInfo");
    setIsLoggedIn(!!userInfo);

    if (!userInfo) {
      navigate("/login"); // Redireciona para o login se não estiver logado
    } else {
      // Captura o token da URL
      const token = new URLSearchParams(window.location.search).get("token");
      if (token) {
        fetchBadgeDetails(token);
      }
    }
  }, [navigate]);

  const fetchBadgeDetails = async (token) => {
    try {
      const response = await axios.get(
        `/api/badges/details-by-token?token=${token}`
      );
      setBadgeDetails(response.data); // Armazena os detalhes da badge para visualização
      toast.info("Clique para reivindicar sua badge!", { autoClose: false });
    } catch (error) {
      console.error("Erro ao buscar detalhes da badge:", error);
      toast.error("Erro ao carregar os detalhes da badge.");
    }
  };

  const claimBadge = async () => {
    const token = new URLSearchParams(window.location.search).get("token");
    try {
      const response = await axios.get(
        `/api/badges/confirm-badge?token=${token}`
      );
      if (response.status === 200) {
        setIsClaimed(true);
        toast.success("Badge reivindicada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao reivindicar a badge:", error);
      toast.error("Erro ao reivindicar a badge.");
    }
  };

  return (
    <div className="claim-badge-page">
      <ToastContainer />
      {isLoggedIn && badgeDetails && !isClaimed && (
        <div className="badge-preview">
          <h2>Pré-visualização da Badge</h2>
          <img
            src={badgeDetails.image_url}
            alt={badgeDetails.name_badge}
            className="badge-image"
          />
          <p>
            <strong>Nome:</strong> {badgeDetails.name_badge}
          </p>
          <p>
            <strong>Descrição:</strong> {badgeDetails.desc_badge}
          </p>
          <button onClick={claimBadge} className="claim-button">
            Reivindicar Badge
          </button>
        </div>
      )}
      {isClaimed && <p>Parabéns! Sua badge foi reivindicada com sucesso.</p>}
    </div>
  );
};

export default ClaimBadgePage;
