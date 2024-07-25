import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Certifique-se de que o caminho está correto

const Home = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  const verificaLogin = () => {
    const usuarioEmpresarial = sessionStorage.getItem("usuarioEmpresarial");
    const usuarioComum = sessionStorage.getItem("usuarioComum");
    const usuarioAdmin = sessionStorage.getItem("usuarioAdmin");

    if (usuarioEmpresarial || usuarioComum || usuarioAdmin) {
      document.querySelector("#atividadesGerais").style.display = "none";
    } else {
      document.querySelector("#atividadesGerais").style.display = "block";
    }

    document.querySelector("#atividadesUA").style.display = usuarioAdmin
      ? "block"
      : "none";
    document.querySelector("#atividadesUE").style.display = usuarioEmpresarial
      ? "block"
      : "none";
    document.querySelector("#atividadesUC").style.display = usuarioComum
      ? "block"
      : "none";

    if (usuarioEmpresarial) {
      setUserType("business");
      setUser(JSON.parse(usuarioEmpresarial));
    } else if (usuarioComum) {
      setUserType("common");
      setUser(JSON.parse(usuarioComum));
    } else if (usuarioAdmin) {
      setUserType("admin");
      setUser(JSON.parse(usuarioAdmin));
    } else {
      setUserType(null);
      setUser(null);
    }
  };

  useEffect(() => {
    verificaLogin();
    window.onstorage = verificaLogin;
  }, []);

  return (
    <div>
      <Navbar userType={userType} user={user} />
      <div id="atividadesGerais">
        <h2>Atividades Gerais</h2>
        <p>Conteúdo visível quando nenhum usuário está logado.</p>
      </div>
      <div id="atividadesUA" style={{ display: "none" }}>
        <h2>Atividades do Admin</h2>
        <p>Conteúdo visível apenas para o Admin.</p>
      </div>
      <div id="atividadesUE" style={{ display: "none" }}>
        <h2>Atividades Empresariais</h2>
        <p>Conteúdo visível apenas para Usuários Empresariais.</p>
      </div>
      <div id="atividadesUC" style={{ display: "none" }}>
        <h2>Atividades Comuns</h2>
        <p>Conteúdo visível apenas para Usuários Comuns.</p>
      </div>
    </div>
  );
};

export default Home;
