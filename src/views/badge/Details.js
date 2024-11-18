import React, { useState, useEffect } from "react";
import BadgeDetails from "../../components/BadgeDetails";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/BadgeDetails.css";

const Details = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const { id_badge } = useParams(); 

  const verificaLogin = async () => {
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
      setUserType("business");
      setUser(userInfoResponse.data);
    } else if (userType === "UA") {
      let userInfoResponse = await axios.get(
        `http://localhost:7004/admin/acessa-info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserType("admin");
      setUser(userInfoResponse.data);
    }
    else{
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