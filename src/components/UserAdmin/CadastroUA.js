import React, { Component } from 'react'
import { InputText } from "primereact/inputtext"
import { Button } from 'primereact/button'
import { Messages } from 'primereact/messages'
import { cadastrarUA } from  '../../controllers/UserAdminCTR'

export default class CadastroUA extends Component {
    constructor(props){
        super(props)
        this.state = {
            emailAdmin: "",
            senha: "",
            nomeAdmin: "",
            cargo: "",
            codigoValidacao: "",
        }
    }

    onSubmit = (e) => {
        console.log('Entrei em onSubmit Cadastrar UA')
        e.preventDefault()
        const estado = this.state
        cadastrarUA(
            estado.emailAdmin,
            estado.senha,
            estado.nomeAdmin,
            estado.cargo,
            estado.codigoValidacao
        ).then(response => {
            if(response.sucesso){
               this.setState({
                    emailAdmin: "",
                    senha: "",
                    nomeAdmin: "",
                    cargo: "",
                    codigoValidacao: ""
                }) 
            }
            this.mensagem.replace(response.pacote)
        })
    }

    render() {
        let estado = this.state
        return (
            <div className="mt-4">
                <form onSubmit={this.onSubmit}>
                    <div className='card pl-3 pr-3 pb-3'>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-user'></i>
                            </span>
                            <InputText
                            id='nomeAdminInputCadastroUA'
                            type='text'
                            placeholder='Insira o seu nome completo'
                            value={estado.nomeAdmin}
                            onChange={e => this.setState({nomeAdmin: e.target.value})}
                            required/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-envelope'></i>
                            </span>
                            <InputText
                            id='emailAdminInputCadastroUA'
                            type='email'
                            placeholder='Insira o um e-mail para a conta'
                            value={estado.emailAdmin}
                            onChange={e => this.setState({emailAdmin: e.target.value})}
                            required/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-lock'></i>
                            </span>
                            <InputText
                            id='senhaInputCadastroUA'
                            type='password'
                            placeholder='Insira a senha para a conta'
                            value={estado.senha}
                            onChange={e => this.setState({senha: e.target.value})}
                            required/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-user-edit'></i>
                            </span>
                            <InputText
                            id='cargoInputCadastroUA'
                            type='text'
                            placeholder='Qual é o seu cargo?'
                            value={estado.cargo}
                            onChange={e => this.setState({cargo: e.target.value})}
                            required/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-key'></i>
                            </span>
                            <InputText
                            id='codigoValidacaoInputCadastroUE'
                            type='password'
                            placeholder='Insira o código de validação'
                            value={estado.codigoValidacao}
                            onChange={e => this.setState({codigoValidacao: e.target.value})}
                            required/>
                        </div>
                        <Button
                        id='submitButtonCadastroUA'
                        className='mt-5 w-min border-round-lg'
                        type='submit'
                        label='Cadastrar'
                        icon='pi pi-check'/>
                    </div>
                </form>
                <Messages id='mensagensGeraisCadastroUA' ref={el => this.mensagem = el}></Messages>
            </div>
        )
    }
}