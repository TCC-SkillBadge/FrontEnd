// src/views/App.js
import React, { useState, useEffect } from "react";
import "../styles/App.css";
import "primeflex/primeflex.css";
import "primeflex/themes/primeone-dark.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { Routes, Route } from "react-router-dom";

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

import ApiReference from "./ApiReference";
import About from "./About";
import Dashboard from "./Dashboard";
// Import TestPage apenas se estiver usando
// import TestPage from "./TestPage"; // Remova se não precisar

function App() {
  // Gerenciar o userType e user no App.js
  // const [userType, setUserType] = useState(null);
  // const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const storedUserType = sessionStorage.getItem("tipoUsuario");
  //   const storedUserInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  //   if (storedUserType) {
  //     setUserType(storedUserType);
  //   }

  //   if (storedUserInfo) {
  //     setUser(storedUserInfo);
  //   }
  // }, []);

  return (
    <div className="App">
      {/* Passar userType e user como props para NavBar */}
      {/* <NavBar userType={userType} user={user} /> */}
      <div className="content">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/workflow" element={<Workflow />} />
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
          <Route path="/price" element={<Price />} />
          <Route path="/createServicePlan" element={<CreateServicePlan />} />
          <Route path="/edit-plan/:id" element={<EditServicePlan />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/api-reference" element={<ApiReference />} />
          <Route path="/funcionalidades" element={<FuncionalidadesManager />} />
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
          {/* <Route path="/test" element={<TestPage />} /> */}{" "}
          {/* Remova se não precisar */}
        </Routes>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
