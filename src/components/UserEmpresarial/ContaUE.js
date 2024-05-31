import React, { Component } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Messages } from 'primereact/messages'
import { Navigate } from 'react-router-dom'
import Loading from '../Loading'
import { acessaInfoUE } from '../../controllers/UserEmpresarialCTR'

export default class ContaUE extends Component {
    constructor(props){
        super(props)
        this.state = {
            razaoSocial: "",
            emailComercial: "",
            cnpj: "",
            cep: "",
            logradouro: "",
            bairro: "",
            municipio: "",
            suplemento: "",
            numeroContato: "",
            msg: false,
            logado: true
        }
    }

    componentDidMount(){
        const usuarioEmpresarial = sessionStorage.getItem('usuarioEmpresarial')
        if(usuarioEmpresarial){
            const { token, tipoUsuario } = JSON.parse(usuarioEmpresarial)
            acessaInfoUE(token, tipoUsuario).then(response => {
                if(response.sucesso){
                    console.log(response.pacote)
                    const dados = response.pacote
                    this.setState({
                        razaoSocial: dados.razao_social,
                        emailComercial: dados.email_comercial,
                        cnpj: dados.cnpj,
                        cep: dados.cep,
                        logradouro: dados.logradouro,
                        bairro: dados.bairro,
                        municipio: dados.municipio,
                        suplemento: dados.suplemento,
                        numeroContato: dados.numero_contato,
                        msg: false
                    })
                }
                else{
                    this.mensagem.replace(response.pacote)
                    this.setState({msg: true})
                }
            })
        }
    }

    sairConta = () => {
        sessionStorage.removeItem('usuarioEmpresarial')
        this.setState({logado: false})
    }

    componentWillUnmount(){
        this.props.refresh()
    }

    render() {
        const estado = this.state
        if(!estado.logado) return <Navigate to='/'/>
        return (
            <div>
                <Messages id='mensagemContaUE' ref={(el) => this.mensagem = el}></Messages>
                {
                    !this.state.msg &&
                    (estado.cnpj === "" ? <Loading/> : <InfoUE infos={estado}/>)
                }
                <Button
                id='botaoSairContaLoginUE'
                icon='pi pi-sign-out'
                className='p-button-danger mt-4 mr-5 ml-5'
                label='Sair da Conta'
                onClick={this.sairConta}/>
            </div>
            
        )
    }
}

class InfoUE extends Component{
    render(){
        const infos = this.props.infos
        return(
            <div className='mr-5 ml-5'>
                <h1>Conta:</h1>
                <div className='card'>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            Razão Social:
                        </span>
                        <InputText
                        id='outputRazaoSocialLoginUE'
                        value={infos.razaoSocial}
                        disabled/>
                    </div>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            Email Comercial:
                        </span>
                        <InputText
                        id='outputEmailComercialLoginUE'
                        value={infos.emailComercial}
                        disabled/>
                    </div>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            CNPJ:
                        </span>
                        <InputText
                        id='outputCNPJLoginUE'
                        value={infos.cnpj}
                        disabled/>
                    </div>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            Número de Contato:
                        </span>
                        <InputText
                        id='outputNumeroContatoLoginUE'
                        value={infos.numeroContato}
                        disabled/>
                    </div>
                    <div className='card'>
                        <div className='p-inputgroup'>
                            <span className='p-inputgroup-addon'>
                                CEP:
                            </span>
                            <InputText
                            id='outputCEPLoginUE'
                            value={infos.cep}
                            disabled/>
                        </div>
                        <div className='p-inputgroup'>
                            <span className='p-inputgroup-addon'>
                                Município:
                            </span>
                            <InputText
                            id='outputMunicipioLoginUE'
                            value={infos.municipio}
                            disabled/>
                        </div>
                        <div className='p-inputgroup'>
                            <span className='p-inputgroup-addon'>
                                Bairro:
                            </span>
                            <InputText
                            id='outputBairroLoginUE'
                            value={infos.bairro}
                            disabled/>
                        </div>
                        <div className='p-inputgroup'>
                            <span className='p-inputgroup-addon'>
                                Logradouro:
                            </span>
                            <InputText
                            id='outputLogradouroLoginUE'
                            value={infos.logradouro}
                            disabled/>
                        </div>
                        <div className='p-inputgroup'>
                            <span className='p-inputgroup-addon'>
                                Suplemento:
                            </span>
                            <InputText
                            id='outputSuplementoLoginUE'
                            value={infos.suplemento}
                            disabled/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}