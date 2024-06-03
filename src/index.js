import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import Login from './common-pages/Login'
import Cadastro from './common-pages/Cadastro'
import ContaUA from './components/UserAdmin/ContaUA'
import ContaUE from './components/UserEmpresarial/ContaUE'
import ContaUC from './components/UserComum/ContaUC'
import PesquisaEmpr from './components/UserEmpresarial/PesquisaEmpr'
import PesquisaAdmin from './components/UserAdmin/PesquisaAdmin'
import ListarUCs from './components/UserAdmin/ListarUCs'
import ListarUEs from './components/UserAdmin/ListarUEs'
import reportWebVitals from './reportWebVitals'
import { RouterProvider, createHashRouter } from 'react-router-dom'

const router = createHashRouter([{
  path: '/',
  element: <App />,
  children: [
    { path: '/login', element: <Login /> },
    { path: '/cadastro', element: <Cadastro /> },
    { path: '/contaUE', element: <ContaUE /> },
    { path: '/contaUC', element: <ContaUC /> },
    { path: '/contaUA', element: <ContaUA /> },
    { path: '/pesquisaEmpr', element: <PesquisaEmpr /> },
    { path: '/pesquisaAdmin', element: <PesquisaAdmin /> },
    { path: '/listarUCs', element: <ListarUCs /> },
    { path: '/listarUEs', element: <ListarUEs /> }
  ]
}]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <RouterProvider router={router}/>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
