import React from "react";
import "../styles/App.css";
import "primeflex/primeflex.css";
import "primeflex/themes/primeone-dark.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import Navbar from "../components/Navbar";

function App() {
  const userType = "common"; // Pode ser 'common', 'business' ou 'admin'

  return (
    <div>
      <Navbar userType={userType} />
    </div>
  );
}

export default App;
