import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Certifique-se de que o caminho está correto
import "../styles/Home.css"; // Certifique-se de criar este arquivo de estilo

const Home = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  const verificaLogin = () => {
    const usuarioEmpresarial = sessionStorage.getItem("usuarioEmpresarial");
    const usuarioComum = sessionStorage.getItem("usuarioComum");
    const usuarioAdmin = sessionStorage.getItem("usuarioAdmin");

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
      <div className="home-content">
        <div className="text-container">
          <h1 className="home-title">
            Suas medalhas com a segurança da nossa Blockchain.
          </h1>
          <p className="home-subtitle">
            Um único lugar para <span className="emitir">emitir</span>,{" "}
            <span className="conquistar">conquistar</span> e{" "}
            <span className="armazenar">armazenar</span> todas as suas medalhas
            de maneira segura.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
