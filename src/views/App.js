import React from "react";
import "../styles/App.css";
import "primeflex/primeflex.css";
import "primeflex/themes/primeone-dark.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Cadastro from "./Cadastro";
import Wallet from "./Wallet";
import Workflow from "./Workflow";
import BadgeConsult from "./badge/Consult";
import BadgeCreate from "./badge/Create";
import BadgeEdit from "./badge/Edit";
import ContaUA from "../components/UserAdmin/ContaUA";
import ContaUE from "../components/UserEmpresarial/ContaUE";
import ContaUC from "../components/UserComum/ContaUC";
import PesquisaEmpr from "../components/UserEmpresarial/PesquisaEmpr";
import PesquisaAdmin from "../components/UserAdmin/PesquisaAdmin";
import ListarUCs from "../components/UserAdmin/ListarUCs";
import ListarUEs from "../components/UserAdmin/ListarUEs";
import CreateServicePlan from "./CreateServicePlan";
import EditServicePlan from "./EditServicePlan";
import Price from "./Price";
import ResetPassword from "./ResetPassword"; // Import the new component
import Orders from "./Order";
import UserProfile from "./UserProfile";
import PublicProfile from "./PublicProfile";

/*um comentario
 */ 
function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/badge" element={<BadgeConsult />} />
        <Route path="/badge/create" element={<BadgeCreate />} />
        <Route path="/badge/edit/:id_badge" element={<BadgeEdit />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/contaUE" element={<ContaUE />} />
        <Route path="/contaUC" element={<ContaUC />} />
        <Route path="/contaUA" element={<ContaUA />} />
        <Route path="/pesquisaEmpr" element={<PesquisaEmpr />} />
        <Route path="/pesquisaAdmin" element={<PesquisaAdmin />} />
        <Route path="/listarUCs" element={<ListarUCs />} />
        <Route path="/listarUEs" element={<ListarUEs />} />
        <Route path="/price" element={<Price />} />
        <Route path="/createServicePlan" element={<CreateServicePlan />} />
        <Route path="/edit-plan/:id" element={<EditServicePlan />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />{" "}
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route
          path="/public-profile/:encodedEmail"
          element={<PublicProfile />}
        />
      </Routes>
    </div>
  );
}

export default App;
