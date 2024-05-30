import React, { Component } from 'react'
import { Button } from 'primereact/button'
import { Messages } from 'primereact/messages'
import { InputText } from 'primereact/inputtext'
import { loginUE } from '../controllers/UserEmpresarialCTR'
import { loginUC } from '../controllers/UserComumCTR'
import { loginUA } from '../controllers/UserAdminCTR'

export default class Login extends Component {
    constructor(props){
        super(props)
        this.state = {
            emailComercial: "",
            senha: "",
            usuario: "",
            cabecalho: "Escolha o tipo de Usuário para Login"
        }
    }

    tiposUsuario = {
        Comum: 'Comum',
        Empresarial: 'Empresarial',
        Admin: 'Admin'
    }

    onSubmit = (e) => {
        e.preventDefault()
        switch(this.state.usuario){
            case 'Comum':
                loginUC(this.state.emailComercial, this.state.senha).then(response => {
                    if(response.sucesso) window.location.href = '/contaUC'
                    else this.mensagem.replace(response.pacote)
                })
                break
            case 'Empresarial':
                loginUE(this.state.emailComercial, this.state.senha).then(response => {
                    if(response.sucesso) window.location.href = '/contaUE'
                    else this.mensagem.replace(response.pacote)
                })
                break
            case 'Admin':
                loginUA(this.state.emailComercial, this.state.senha).then(response => {
                    if(response.sucesso) window.location.href = '/contaUA'
                    else this.mensagem.replace(response.pacote)
                })
                break
        }
    }

    escolherUC = () => {
        this.setState({usuario: this.tiposUsuario.Comum, cabecalho: "Entrando como Usuário Comum"})
        //this.mensagem.clear()
    }

    escolherUE = () => {
        this.setState({usuario: this.tiposUsuario.Empresarial, cabecalho: "Entrando como Usuário Empresarial"})
        //this.mensagem.clear()
    }

    escolherUA = () => {
        this.setState({usuario: this.tiposUsuario.Admin, cabecalho: "Entrando como Administrador"})
        //this.mensagem.clear()
    }

    render() {
        return (
            <div className='grid'>
                <div className='col-2 p-4'>
                    <Button
                    id='botaoOpcaoUCLogin'
                    className='border-round-lg block m-1'
                    label='Usuário Comum'
                    icon='pi pi-user'
                    onClick={this.escolherUC}/>
                    <Button
                    id='botaoOpcaoUELogin'
                    className='border-round-lg block m-1'
                    label='Empresa'
                    icon='pi pi-building'
                    onClick={this.escolherUE}/>
                    <Button
                    id='botaoOpcaoUALogin'
                    className='border-round-lg block m-1'
                    label='Admin'
                    icon='pi pi-file'
                    onClick={this.escolherUA}/>
                </div>
                <div className='col-10'>
                    <h1>{this.state.cabecalho}</h1>
                    {this.state.usuario !== "" &&
                    <div className='mr-4'>
                        <form onSubmit={this.onSubmit}>
                            <div className='mt-4'>
                                <h3>Insira o e-mail:</h3>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        <i className='pi pi-envelope'></i>
                                    </span>
                                    <InputText
                                    id='emailInputLoginUE'
                                    type='email'
                                    value={this.state.emailComercial}
                                    onChange={e => this.setState({emailComercial: e.target.value})}
                                    required/>
                                </div>
                            </div>
                            <div className='mt-4'>
                                <h3>Insira a senha:</h3>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        <i className='pi pi-lock'></i>
                                    </span>
                                    <InputText
                                    id='senhaInputLoginUE'
                                    type='password'
                                    value={this.state.senha}
                                    onChange={e => this.setState({senha: e.target.value})}
                                    required/>
                                </div>
                            </div>
                            <Button
                            id='botaoEntrarLoginUE'
                            className='p-button-success mt-4'
                            label='Fazer Login'
                            icon='pi pi-check'
                            type='submit'/>
                        </form>
                        <Messages id='mensagemLoginUE' ref={(el) => this.mensagem = el}></Messages>
                    </div>
                    } 
                </div>   
            </div>
        )
    }
}
