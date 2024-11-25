import React, { useState, useEffect } from "react";
import BadgeDetails from "../../components/BadgeDetails";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/BadgeDetails.css";

const Details = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const { id_badge } = useParams();

  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;

  const verificaLogin = async () => {
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
      setUserType("business");
      setUser(userInfoResponse.data);
    }
    else {
      navigate("/home")
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    verificaLogin();
    window.onstorage = verificaLogin;
  }, []);

  return (
    <div className="badge-details-page">
      <BadgeDetails id_badge={id_badge} url_origem="/badges" />
    </div>
  );
};

export default Details;