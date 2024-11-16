// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./views/App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import necessário

// Crie uma instância do QueryClient
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {" "}
        {/* Envolva o App com QueryClientProvider */}
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
