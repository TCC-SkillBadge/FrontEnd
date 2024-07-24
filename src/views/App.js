import React from "react";
import "../styles/App.css";
import "primeflex/primeflex.css";
import "primeflex/themes/primeone-dark.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import Navbar from "../components/Navbar";

function App() {
  const userType = "common";
  const user = {
    image: "https://example.com/user.jpg", // Substitua com a URL da imagem do usuário
  };

  return (
    <div className="app">
      <Navbar userType={userType} user={user} />
    </div>
  );
}

export default App;
