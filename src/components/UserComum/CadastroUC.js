import React, { Component } from 'react'
import { InputText } from "primereact/inputtext"
import { Button } from 'primereact/button'
import { Messages } from 'primereact/messages'
import { cadastrarUC } from  '../../controllers/UserComumCTR'

export default class CadastroUC extends Component {
    constructor(props){
        super(props)
        this.state = {
            email: "",
            senha: "",
            nomeCompleto: "",
            ocupacao: "",
            paisOrigem: "",
        }
    }

    onSubmit = (e) => {
        e.preventDefault()
        const estado = this.state
        cadastrarUC(
            estado.email,
            estado.senha,
            estado.nomeCompleto,
            estado.ocupacao !== "" ? estado.ocupacao : null,
            estado.paisOrigem !== "" ? estado.paisOrigem : null
        ).then(response => {
            if(response.sucesso){
               this.setState({
                    email: "",
                    senha: "",
                    nomeCompleto: "",
                    ocupacao: "",
                    paisOrigem: ""
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
                            id='nomeCompletoInputCadastroUC'
                            type='text'
                            placeholder='Insira o seu nome completo'
                            value={estado.nomeCompleto}
                            onChange={e => this.setState({nomeCompleto: e.target.value})}
                            required/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-envelope'></i>
                            </span>
                            <InputText
                            id='emailInputCadastroUC'
                            type='email'
                            placeholder='Insira um e-mail para a conta'
                            value={estado.email}
                            onChange={e => this.setState({email: e.target.value})}
                            required/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-lock'></i>
                            </span>
                            <InputText
                            id='senhaInputCadastroUC'
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
                            id='ocupacaoInputCadastroUC'
                            type='text'
                            placeholder='Qual é a sua ocupação?'
                            value={estado.ocupacao}
                            onChange={e => this.setState({ocupacao: e.target.value})}/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-flag-fill'></i>
                            </span>
                            <InputText
                            id='paisOrigemInputCadastroUE'
                            type='text'
                            placeholder='Qual é o seu país de origem?'
                            value={estado.paisOrigem}
                            onChange={e => this.setState({paisOrigem: e.target.value})}/>
                        </div>
                        <Button
                        id='submitButtonCadastroUC'
                        className='mt-5 w-min border-round-lg'
                        type='submit'
                        label='Cadastrar'
                        icon='pi pi-check'/>
                    </div>
                </form>
                <Messages id='mensagensGeraisCadastroUC' ref={el => this.mensagem = el}></Messages>
            </div>
        )
    }
}