import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import './navbar.css'

export default class Navbar extends Component {

  atualizaNavbar = () => {
    const usuarioEmpresarial = sessionStorage.getItem('usuarioEmpresarial')
    const usuarioComum = sessionStorage.getItem('usuarioComum')
    const usuarioAdmin = sessionStorage.getItem('usuarioAdmin')

    if(usuarioEmpresarial || usuarioComum || usuarioAdmin){
      document.querySelector('#atividadesGerais').style.display = 'none'
    }

    usuarioComum ? document.querySelector('#atividadesUC').style.display = 'block' : document.querySelector('#atividadesUC').style.display = 'none'
    usuarioEmpresarial ? document.querySelector('#atividadesUE').style.display = 'block' : document.querySelector('#atividadesUE').style.display = 'none'
    usuarioAdmin ? document.querySelector('#atividadesUA').style.display = 'block' : document.querySelector('#atividadesUA').style.display = 'none'
  }

  componentDidMount(){
    this.atualizaNavbar()
  }

  componentDidUpdate(){
    this.atualizaNavbar()
  }

  render() {
    return (
      <nav>
        <NavLink id='nomeSite' to='./'>Skill Badge</NavLink>
        <ul id='caixaGeralNavBar'>
          <li id='atividadesUA'>
            <ul>
              <li>
                <NavLink to='./listarUCs'>Lista Usuários</NavLink>
              </li>
              <li>
                <NavLink to='./listarUEs'>Lista Empresas</NavLink>
              </li>
              <li>
                <NavLink to='./pesquisaAdmin'>Consultar Usuários</NavLink>
              </li>
              <li>
                <NavLink to='./contaUA'>Conta</NavLink>
              </li>
            </ul>
          </li>
          <li id='atividadesUE'>
            <ul>
              <li>
                <NavLink to='./pesquisaEmpr'>Consultar</NavLink>
              </li>
              <li>
                <NavLink to='./contaUE'>Conta</NavLink>
              </li>
            </ul>
          </li>
          <li id='atividadesUC'>
            <ul>
              <li>
                <NavLink to='./contaUC'>Conta</NavLink>
              </li>
            </ul>
          </li>
          <li id='atividadesGerais'>
            <ul>
              <li>
                <NavLink to='./login'>Login</NavLink>
              </li>
              <li>
                <NavLink to='./cadastro'>Cadastre-se</NavLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    )
  }
}
