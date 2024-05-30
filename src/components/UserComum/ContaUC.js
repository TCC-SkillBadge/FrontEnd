import React, { Component } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Messages } from 'primereact/messages'
import Loading from '../Loading'
import { acessaInfoUC } from '../../controllers/UserComumCTR'

export default class ContaUC extends Component {
    constructor(props){
        super(props)
        this.state = {
            nomeCompleto: "",
            email: "",
            ocupacao: "",
            paisOrigem: "",
            msg: false,
        }
    }

    componentDidMount(){
        const usuarioComum = sessionStorage.getItem('usuarioComum')
        if(usuarioComum){
            const { token, tipoUsuario } = JSON.parse(usuarioComum)
            acessaInfoUC(token, tipoUsuario).then(response => {
                if(response.sucesso){
                    console.log(response.pacote)
                    const dados = response.pacote
                    this.setState({
                        nomeCompleto: dados.nome_completo,
                        email: dados.email,
                        ocupacao: dados.ocupacao,
                        paisOrigem: dados.pais_origem
                    })
                }
                else{
                    this.setState({msg: true})
                    this.mensagem.replace(response.pacote)
                }
            })
        }
    }

    sairConta = () => {
        sessionStorage.removeItem('usuarioComum')
        window.location.href = '/'
    }

    render() {
        const estado = this.state
        return (
            <div className='mr-5 ml-5'>
                <Messages id='mensagemContaUC' ref={(el) => this.mensagem = el}></Messages>
                {
                    !this.state.msg &&
                    (this.state.email === "" ? <Loading/> : <InfoUC infos={estado}/>)
                }
                <Button
                label='Sair da Conta'
                className='p-button-danger mt-4 mr-5 ml-5'
                onClick={this.sairConta}/>
            </div>
        )
    }
}

class InfoUC extends Component{
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
                        id='outputNomeCompletoLoginUC'
                        value={infos.nomeCompleto}
                        disabled/>
                    </div>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            Email:
                        </span>
                        <InputText
                        id='outputEmailLoginUC'
                        value={infos.email}
                        disabled/>
                    </div>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            Ocupação:
                        </span>
                        <InputText
                        id='outputOcupacaoLoginUC'
                        value={infos.ocupacao}
                        disabled/>
                    </div>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            País de Origem:
                        </span>
                        <InputText
                        id='outputPaisOrigemLoginUC'
                        value={infos.paisOrigem}
                        disabled/>
                    </div>
                </div>
            </div>
        )
    }
}
