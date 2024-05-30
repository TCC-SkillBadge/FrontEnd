import React, { Component } from 'react'
import { InputText } from "primereact/inputtext"
import { InputMask } from 'primereact/inputmask'
import { Divider } from 'primereact/divider'
import { Button } from 'primereact/button'
import { Messages } from 'primereact/messages'
import { cadastrarUE, validarCNPJ } from  '../../controllers/UserEmpresarialCTR'

export default class CadastroUE extends Component {
    constructor(props){
        super(props)
        this.state = {
            emailComercial: "",
            senha: "",
            razaoSocial: "",
            cnpj: "",
            cep: "",
            logradouro: "",
            bairro: "",
            municipio: "",
            suplemento: "",
            numeroContato: "",
        }
    }

    onSubmit = (e) => {
        e.preventDefault()
        const estado = this.state
        cadastrarUE(
            estado.emailComercial,
            estado.senha,
            estado.razaoSocial,
            estado.cnpj === "" ? null : estado.cnpj,
            estado.cep === "" ? null : estado.cep,
            estado.logradouro === "" ? null : estado.logradouro,
            estado.bairro === "" ? null : estado.bairro,
            estado.municipio === "" ? null : estado.municipio,
            estado.suplemento === "" ? null : estado.suplemento,
            estado.numeroContato === "" ? null : estado.numeroContato
        ).then(response => {
            if(response.sucesso){
               this.setState({
                    emailComercial: "",
                    senha: "",
                    razaoSocial: "",
                    cnpj: "",
                    cep: "",
                    logradouro: "",
                    bairro: "",
                    municipio: "",
                    suplemento: "",
                    numeroContato: "",
                }) 
            }
            this.mensagens1.replace(response.pacote)
        })
    }

    verificaCNPJ = () => {
        const numerosCNPJ = this.state.cnpj.replace(/[^\d]+/g,'')
        if(numerosCNPJ.length === 14){
            validarCNPJ(numerosCNPJ).then(response => {
                console.log('Executando validarCNPJ() em CadastroUE.js')
                console.log(response)
                if(response.sucesso){
                    this.setState({
                        emailComercial: response.pacote.email,
                        razaoSocial: response.pacote.nome,
                        logradouro: response.pacote.logradouro + (response.pacote.numero === "" ? null : `, n. ${response.pacote.numero}`),
                        bairro: response.pacote.bairro,
                        municipio: response.pacote.municipio,
                        suplemento: response.pacote.complemento,
                    })
                    console.log(this.state)
                }
                else this.mensagens2.replace(response.pacote)
            })
        }
        console.log(this.state)
    }

    componentDidUpdate(_prevProps, prevState){
        if(prevState.cnpj !== this.state.cnpj){
            this.verificaCNPJ()
        }
    }

    render() {
        let estado = this.state
        return (
            <div className="mt-4">
                <form onSubmit={this.onSubmit}>
                    <div className='card pl-3 pr-3 pb-3'>
                        <Divider align='left'>
                            <h4 style={{color: 'gray'}}>Insira o número de CNPJ para pesquisa:</h4>
                        </Divider>
                        <div className='p-inputgroup'>
                            <span className='p-inputgroup-addon'>
                                CNPJ
                            </span>
                            <InputMask
                            id='cnpjInputCadastroUE'
                            placeholder='Insira o número de CNPJ da empresa'
                            mask='99.999.999/9999-99'
                            clear
                            value={estado.cnpj}
                            onChange={e => this.setState({cnpj: e.target.value})}
                            required/>
                        </div>
                        <Messages id='mensagensCNPJCadastroUE' ref={el => this.mensagens2 = el}></Messages>
                        <Divider align='left'>
                            <h4 style={{color: 'gray'}}>Informações da Conta:</h4>
                        </Divider>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-envelope'></i>
                            </span>
                            <InputText
                            id='emailInputCadastroUE'
                            type='email'
                            placeholder='Insira o e-mail comercial de sua empresa'
                            value={estado.emailComercial}
                            onChange={e => this.setState({emailComercial: e.target.value})}
                            required/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-lock'></i>
                            </span>
                            <InputText
                            id='senhaInputCadastroUE'
                            type='password'
                            placeholder='Insira a senha para a conta'
                            value={estado.senha}
                            onChange={e => this.setState({senha: e.target.value})}
                            required/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-at'></i>
                            </span>
                            <InputText
                            id='razaoSocialInputCadastroUE'
                            type='text'
                            placeholder='Insira a razão social da empresa'
                            value={estado.razaoSocial}
                            onChange={e => this.setState({razaoSocial: e.target.value})}
                            required/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-phone'></i>
                            </span>
                            <InputMask
                            id='numeroContatoInputCadastroUE'
                            placeholder='Insira um número para contato'
                            mask='(99)(99)9999-9999'
                            value={estado.numeroContato}
                            onChange={e => this.setState({numeroContato: e.target.value})}/>
                        </div>
                        <Divider align='left'>
                            <h4 style={{color: 'gray'}}>Endereço da Sede:</h4>
                        </Divider>
                        <div className='p-inputgroup'>
                            <span className='p-inputgroup-addon'>
                                CEP
                            </span>
                            <InputMask
                            id='cepInputCadastroUE'
                            placeholder='Insira o CEP'
                            mask='99999-999'
                            value={estado.cep}
                            onChange={e => this.setState({cep: e.target.value})}/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-map'></i>
                            </span>
                            <InputText
                            id='municipioInputCadastroUE'
                            type='text'
                            placeholder='Insira o município'
                            value={estado.municipio}
                            onChange={e => this.setState({municipio: e.target.value})}/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-map'></i>
                            </span>
                            <InputText
                            id='bairroInputCadastroUE'
                            type='text'
                            placeholder='Insira o bairro'
                            value={estado.bairro}
                            onChange={e => this.setState({bairro: e.target.value})}/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-map'></i>
                            </span>
                            <InputText
                            id='logradouroInputCadastroUE'
                            type='text'
                            placeholder='Insira o logradouro'
                            value={estado.logradouro}
                            onChange={e => this.setState({logradouro: e.target.value})}/>
                        </div>
                        <div className='p-inputgroup mt-4'>
                            <span className='p-inputgroup-addon'>
                                <i className='pi pi-building'></i>
                            </span>
                            <InputText
                            id='suplementoInputCadastroUE'
                            type='text'
                            placeholder='Suplementos do endereço (bloco, sala etc.)'
                            value={estado.suplemento}
                            onChange={e => this.setState({suplemento: e.target.value})}/>
                        </div>
                        <Button
                        id='submitButtonCadastroUE'
                        className='mt-5 w-min border-round-lg'
                        type='submit'
                        label='Cadastrar'
                        icon='pi pi-check'/>
                    </div>
                </form>
                <Messages id='mensagensGeraisCadastroUE' ref={el => this.mensagens1 = el}></Messages>
            </div>
        )
    }
}