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
    image:
      "https://img.freepik.com/fotos-gratis/pessoa-de-origem-indiana-se-divertindo_23-2150285283.jpg", 
  };

  return (
    <div className="app">
      <Navbar userType={userType} user={user} />
    </div>
  );
}

export default App;
