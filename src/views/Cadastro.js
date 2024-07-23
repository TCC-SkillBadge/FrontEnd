import React, { Component } from 'react'
import { Button } from 'primereact/button'
import CadastroUE from '../components/UserEmpresarial/CadastroUE'
import CadastroUC from '../components/UserComum/CadastroUC'
import CadastroUA from '../components/UserAdmin/CadastroUA'

export default class Cadastro extends Component {
    constructor(props){
        super(props)
        this.state = {
            usuario: "",
            cabecalho: "Escolha o tipo de Usuário para Cadastro"
        }
    }

    tiposUsuario = {
        Comum: 'Comum',
        Empresarial: 'Empresarial',
        Admin: 'Admin'
    }

    escolherUC = () => {
        this.setState({usuario: this.tiposUsuario.Comum, cabecalho: "Cadastro de Usuário Comum"})
    }

    escolherUE = () => {
        this.setState({usuario: this.tiposUsuario.Empresarial, cabecalho: "Cadastro de Usuário Empresarial"})
    }

    escolherUA = () => {
        this.setState({usuario: this.tiposUsuario.Admin, cabecalho: "Cadastro de Usuário Administrativo"})
    }

    render() {
        return (
            <div className='grid'>
                <div className="col-2 p-4">
                    <Button
                    id='botaoOpcaoUCCadastro'
                    className='border-round-lg block m-1'
                    label='Usuário Comum'
                    icon='pi pi-user'
                    onClick={this.escolherUC}/>
                    <Button
                    id='botaoOpcaoUECadastro'
                    className='border-round-lg block m-1'
                    label='Empresa'
                    icon='pi pi-building'
                    onClick={this.escolherUE}/>
                    <Button
                    id='botaoOpcaoUACadastro'
                    className='border-round-lg block m-1'
                    label='Admin'
                    icon='pi pi-file'
                    onClick={this.escolherUA}/>
                </div>
                <div className="col-10">
                    <h1>{this.state.cabecalho}</h1>
                    {this.state.usuario === this.tiposUsuario.Empresarial ? <CadastroUE/> : null}
                    {this.state.usuario === this.tiposUsuario.Comum ? <CadastroUC/> : null}
                    {this.state.usuario === this.tiposUsuario.Admin ? <CadastroUA/> : null}
                </div>
            </div>
        )
    }
}
