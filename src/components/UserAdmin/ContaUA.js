import React, { Component } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Messages } from 'primereact/messages'
import { Navigate } from 'react-router-dom'
import Loading from '../Loading'
import { acessaInfoUA } from '../../controllers/UserAdminCTR'

export default class ContaUA extends Component {
    constructor(props){
        super(props)
        this.state = {
            nomeAdmin: "",
            emailAdmin: "",
            cargo: "",
            msg: false,
            logado: true,
            destinoSaida: "",
        }
    }

    componentDidMount(){
        const usuarioAdmin = sessionStorage.getItem('usuarioAdmin')
        if(usuarioAdmin){
            const { token, tipoUsuario } = JSON.parse(usuarioAdmin)
            acessaInfoUA(token, tipoUsuario).then(response => {
                if(response.sucesso){
                    console.log(response.pacote)
                    const dados = response.pacote
                    this.setState({
                        nomeAdmin: dados.nome_admin,
                        emailAdmin: dados.email_admin,
                        cargo: dados.cargo,
                    })
                }
                else{
                    switch(response.caso){
                        case 'expirado':
                            alert(response.pacote)
                            this.sairConta('/login')
                            break
                        default:
                            this.mensagem.replace(response.pacote)
                            this.setState({msg: true})
                    }
                }
            })
        }
    }

    sairConta = (destino) => {
        sessionStorage.removeItem('usuarioAdmin')
        dispatchEvent(new Event('storage'))
        this.setState({ logado: false, destinoSaida: destino })
    }

    render() {
        const estado = this.state
        if(!estado.logado) return <Navigate to={estado.destinoSaida}/>
        return (
            <div className='mr-5 ml-5'>
                <Messages id='mensagemContaUA' ref={(el) => this.mensagem = el}></Messages>
                {
                    !this.state.msg &&
                    (this.state.emailAdmin === "" ? <Loading/> : <InfoUA infos={estado}/>)
                }
                <Button
                label='Sair da Conta'
                className='p-button-danger mt-4 mr-5 ml-5'
                onClick={() => this.sairConta('/')}/>
            </div>
        )
    }
}

class InfoUA extends Component{
    render(){
        const infos = this.props.infos
        return(
            <div className='mr-5 ml-5'>
                <h1>Conta:</h1>
                <div className='card'>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            Nome Completo:
                        </span>
                        <InputText
                        id='outputNomeCompletoLoginUA'
                        value={infos.nomeAdmin}
                        disabled/>
                    </div>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            Email Administrativo:
                        </span>
                        <InputText
                        id='outputEmailAdminLoginUA'
                        value={infos.emailAdmin}
                        disabled/>
                    </div>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            Cargo:
                        </span>
                        <InputText
                        id='outputCargoLoginUA'
                        value={infos.cargo}
                        disabled/>
                    </div>
                </div>
            </div>
        )
    }
}