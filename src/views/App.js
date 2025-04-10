// src/views/App.js
import React, { useState, useEffect } from "react";
import "../styles/App.css";
import "primeflex/primeflex.css";
import "primeflex/themes/primeone-dark.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { Routes, Route, useNavigate } from "react-router-dom";

// Importar NavBar e Footer
import NavBar from "../components/Navbar"; // Certifique-se que NavBar.js está em src/components/
import Footer from "../components/Footer"; // Certifique-se que Footer.js está em src/components/

// Importar outros componentes de página
import Home from "./Home";
import Login from "./Login";
import Create from "./Create";
import Wallet from "./Wallet";
import Workflow from "./Workflow";
import BadgeConsult from "./badge/Consult";
import BadgeCreate from "./badge/Create";
import BadgeEdit from "./badge/Edit";
import BadgeDetails from "./badge/Details";
import AccountUA from "../components/UserAdmin/AccountUA";
import AccountUE from "../components/UserEmpresarial/AccountUE";
import AccountUC from "../components/UserComum/AccountUC";
import SearchUE from "../components/UserEmpresarial/SearchUE";
import SearchAdmin from "../components/UserAdmin/SearchAdmin";
import ListUCs from "../components/UserAdmin/ListUCs";
import ListUEs from "../components/UserAdmin/ListUEs";
import CreateServicePlan from "./CreateServicePlan";
import EditServicePlan from "./EditServicePlan";
import Price from "./Price";
import ResetPassword from "./ResetPassword";
import Orders from "./Order";
import UserProfile from "./UserProfile";
import PublicProfile from "./PublicProfile";
import PublicProfileEnterprise from "./PublicProfileEnterprise";
import ManageTest from "../components/UserAdmin/ManageTest";
import ListSoftSkills from "../components/UserAdmin/ListSoftSkills";
import ProficiencyTest from "../components/UserComum/ProficiencyTest";
import { ResultScreen } from "../components/UserComum/ResultScreen";
import Requests from "./Requests";
import ClaimBadgePage from "./ClaimBadgePage";
import FuncionalidadesManager from "../components/FuncionalidadesManager";
import GeneralSearch from "./GeneralSearch";
import BadgePublicDisplay from "./BadgePublicDisplay";
import ApiReference from "./ApiReference";
import About from "./About";
import Dashboard from "./Dashboard";
import DataVisualization from "./DataVisualization"; // Importado do segundo arquivo
import ConfirmBadge from "./ConfirmBadge";
import CommonDetails from "./badge/CommonDetails";
import AdminDataVisualization from "./AdminDataVisualization";

import axios from "axios"; // Importar axios para uso no App.js

function App() {
  // Gerenciar o userType, user e token no App.js
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  const adminUrl = process.env.REACT_APP_API_ADMIN;
  const commonUrl = process.env.REACT_APP_API_COMUM;
  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;

  // Função para buscar as informações do usuário
  const fetchUserInfo = async () => {
    try {
      if (!token) {
        setUser(null);
        setUserType(null);
        return;
      }

      let response;

      if (userType === "UC") {
        response = await axios.get(`${commonUrl}/api/user/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } else if (userType === "UE") {
        response = await axios.get(
          `${enterpriseUrl}/api/acessar-info-usuario-jwt`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data);
      } else if (userType === "UA") {
        response = await axios.get(`${adminUrl}/admin/acessa-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao obter informações do usuário:", error);
      setUser(null);
      setUserType(null);
      setToken(null);
      navigate("/login");
    }
  };


  // Função para verificar o login armazenado
  const verifyStoredLogin = () => {
    console.log("Verifying stored login");

    const storedTokenLS = localStorage.getItem("token");
    const storedUserTypeLS = localStorage.getItem("tipoUsuario");
    const storedUserInfoLS = JSON.parse(localStorage.getItem("userInfo"));

    const storedTokenSS = sessionStorage.getItem("token");
    const storedUserTypeSS = sessionStorage.getItem("tipoUsuario");
    const storedUserInfoSS = JSON.parse(sessionStorage.getItem("userInfo"));

    if (storedTokenSS && storedUserTypeSS && storedUserInfoSS) {
      setUserType(storedUserTypeSS);
      setUser(storedUserInfoSS);
      setToken(storedTokenSS);
    } else if (storedTokenLS && storedUserTypeLS && storedUserInfoLS) {
      sessionStorage.setItem("tipoUsuario", storedUserTypeLS);
      sessionStorage.setItem("userInfo", JSON.stringify(storedUserInfoLS));
      sessionStorage.setItem("token", storedTokenLS);

      const storedEmail = localStorage.getItem("email");
      const storedEncodedEmail = localStorage.getItem("encodedEmail");

      if (storedEmail) sessionStorage.setItem("email", storedEmail);
      if (storedEncodedEmail)
        sessionStorage.setItem("encodedEmail", storedEncodedEmail);

      setUserType(storedUserTypeLS);
      setUser(storedUserInfoLS);
      setToken(storedTokenLS);
    }
  };

  // Função para verificar se está logado
  const verifyLoggedIn = () => {
    const storedUserTypeSS = sessionStorage.getItem("tipoUsuario");
    const storedUserInfoSS = JSON.parse(sessionStorage.getItem("userInfo"));
    const storedTokenSS = sessionStorage.getItem("token");

    setUserType(storedUserTypeSS);
    setUser(storedUserInfoSS);
    setToken(storedTokenSS);
  };

  useEffect(() => {
    verifyStoredLogin();

    window.addEventListener("LoginChange", verifyLoggedIn);

    return () => {
      window.removeEventListener("LoginChange", verifyLoggedIn);
    };
  }, []);

  // Listener para atualizar a imagem de perfil
  useEffect(() => {
    const handleProfilePictureUpdate = () => {
      const updatedImage = sessionStorage.getItem("userImage");
      if (updatedImage && user) {
        setUser((prevUser) => ({
          ...prevUser,
          imageUrl: updatedImage,
        }));
      }
    };

    window.addEventListener(
      "ProfilePictureUpdated",
      handleProfilePictureUpdate
    );

    return () => {
      window.removeEventListener(
        "ProfilePictureUpdated",
        handleProfilePictureUpdate
      );
    };
  }, [user]);

  // Recarregar informações do usuário sempre que token ou userType mudar
  useEffect(() => {
    if (token && userType) {
      fetchUserInfo();
    }
  }, [token, userType]);

  return (
    <div className="App">
      <NavBar token={token} user={user} userType={userType} />
      <div className="content">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/workflow/:id_request" element={<Workflow />} />
          <Route path="/badges" element={<BadgeConsult />} />
          <Route path="/badges/create" element={<BadgeCreate />} />
          <Route path="/badges/edit/:id_badge" element={<BadgeEdit />} />
          <Route path="/badges/details/:id_badge" element={<BadgeDetails />} />
          <Route path="/create" element={<Create />} />
          <Route path="/accountUE" element={<AccountUE />} />
          <Route path="/accountUC" element={<AccountUC />} />
          <Route path="/accountUA" element={<AccountUA />} />
          <Route path="/searchUE" element={<SearchUE />} />
          <Route path="/searchAdmin" element={<SearchAdmin />} />
          <Route path="/listUCs" element={<ListUCs />} />
          <Route path="/listUEs" element={<ListUEs />} />
          <Route path="/plans" element={<Price />} />
          <Route path="/createServicePlan" element={<CreateServicePlan />} />
          <Route path="/edit-plan/:id" element={<EditServicePlan />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile/:encodedEmail" element={<UserProfile />} />
          <Route path="/api-reference" element={<ApiReference />} />
          <Route path="/funcionalidades" element={<FuncionalidadesManager />} />
          <Route path="/admin/analysis" element={<AdminDataVisualization />} />
          <Route
            path="/details/common/:id_badge"
            element={<CommonDetails />}
          />{" "}
          {/* Nova rota para usuários comuns */}
          <Route
            path="/public-profile/:encodedEmail"
            element={<PublicProfile />}
          />
          <Route
            path="/public-profile-enterprise/:encodedEmail"
            element={<PublicProfileEnterprise />}
          />
          <Route path="/manage-test" element={<ManageTest />} />
          <Route path="/list-soft-skills" element={<ListSoftSkills />} />
          <Route path="/proficiency-test" element={<ProficiencyTest />} />
          <Route path="/result-screen" element={<ResultScreen />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/claim-badge" element={<ClaimBadgePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/general-search" element={<GeneralSearch />} />
          <Route
            path="/badge-public-display/:id_badge/:username_enterprise"
            element={<BadgePublicDisplay />}
          />
          <Route path="/analysis" element={<DataVisualization />} />
          <Route path="/confirm-badge" element={<ConfirmBadge />} />{" "}
          {/* Nova Rota */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
