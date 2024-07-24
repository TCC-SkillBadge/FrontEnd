import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./views/App";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider, createHashRouter } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";


const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Remova as rotas inexistentes
      // { path: '/login', element: <Login /> },
      // { path: '/cadastro', element: <Cadastro /> },
      // { path: '/contaUE', element: <ContaUE /> },
      // { path: '/contaUC', element: <ContaUC /> },
      // { path: '/contaUA', element: <ContaUA /> },
      // { path: '/pesquisaEmpr', element: <PesquisaEmpr /> },
      // { path: '/pesquisaAdmin', element: <PesquisaAdmin /> },
      // { path: '/listarUCs', element: <ListarUCs /> },
      // { path: '/listarUEs', element: <ListarUEs /> }
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);

reportWebVitals();
