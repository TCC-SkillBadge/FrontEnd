// src/views/CommonDetails.js

import React, { useState, useEffect } from "react";
import BadgeDetails from "../../components/BadgeDetails";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/BadgeDetails.css";
import { ToastContainer, toast } from "react-toastify"; // Importação para notificações
import "react-toastify/dist/ReactToastify.css";

const CommonDetails = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const { id_badge } = useParams();

  const commonUserUrl =
    process.env.REACT_APP_API_COMUM || "http://localhost:7000"; // Ajuste conforme sua API

  const navigate = useNavigate();

  const verifyLogin = async () => {
    // Recupera o token e o tipo de usuário de sessionStorage ou localStorage
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    const storedUserType =
      sessionStorage.getItem("tipoUsuario") ||
      localStorage.getItem("tipoUsuario");

    if (storedUserType === "UC") {
      // Verifica se o tipo de usuário é "UC" (Usuário Comum)
      try {
        // Faz a requisição para obter as informações do usuário comum
        const userInfoResponse = await axios.get(
          `${commonUserUrl}/api/user/info`, // Endpoint para obter informações do usuário comum
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserType("UC");
        setUser(userInfoResponse.data);
      } catch (error) {
        console.error("Erro ao obter informações do usuário:", error);
        toast.error("Erro na autenticação. Por favor, faça login novamente.");
        navigate("/login"); // Redireciona para a página de login se houver erro
      }
    } else {
      navigate("/home"); // Redireciona para a página home se não for usuário comum
    }
  };

  useEffect(() => {
    verifyLogin();
    window.onstorage = verifyLogin; // Atualiza o estado se houver mudanças no storage
  }, []);

  return (
    <div className="badge-details-page">
      <BadgeDetails id_badge={id_badge} url_origem="/wallet" />
    </div>
  );
};

export default CommonDetails;
