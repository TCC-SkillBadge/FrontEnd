import React, { Component } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Messages } from 'primereact/messages'
import Loading from '../Loading'
import { EMPRconsultarUC } from '../../controllers/UserComumCTR'

export default class PesquisaEmpr extends Component {
    constructor(props){
        super(props)
        this.state = {
            usuarioCPesquisado: '',
            usuarioC: null,
            msg: false,
            pesquisando: false
        }
    }

    pesquisar = () => {
        if(this.state.usuarioCPesquisado === ''){
            this.mensagem.replace({severity: 'error', summary: 'Erro', detail: 'Digite um termo de pesquisa'})
            return
        }
        this.mensagem.clear()
        this.setState({usuarioC: null, pesquisando: true, msg: false})
        const usuarioEmpresarial = sessionStorage.getItem('usuarioEmpresarial')
        if(usuarioEmpresarial){
            const { token, tipoUsuario } = JSON.parse(usuarioEmpresarial)
            EMPRconsultarUC(token, tipoUsuario, this.state.usuarioCPesquisado).then(response => {
                if(response.sucesso){
                    this.setState({usuarioC: response.pacote, usuarioCPesquisado: "", pesquisando: false, msg: false})
                }
                else{
                    this.setState({pesquisando: false, msg: true})
                    this.mensagem.replace(response.pacote)
                }
            })
        }
    }

    render() {
        return (
            <div className='p-4'>
                <h1>Pesquisar</h1>
                <div className='flex inline'>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            <i className='pi pi-search'></i>
                        </span>
                        <InputText
                        id='inputPesquisaAdmin'
                        placeholder='Insira o nome ou e-mail do usuário comum'
                        value={this.state.usuarioCPesquisado}
                        onChange={e => this.setState({ usuarioCPesquisado: e.target.value })}></InputText>
                    </div>
                    <Button
                    id='botaoPesquisaAdmin'
                    label='Pesquisar'
                    icon='pi pi-check'
                    onClick={this.pesquisar}
                    onKeyDown={e => { if(e.key === 'Enter') this.pesquisar() }}/>
                </div>
                <Messages id='mensagemPesquisaAdmin' ref={el => this.mensagem = el}></Messages>
                {
                    !this.state.msg &&
                    (
                        this.state.usuarioC ?
                        <ResultadoPesquisa resultadoPesquisa={this.state.usuarioC}/> : 
                        (this.state.pesquisando ? <Loading/> : null)
                    )
                }
            </div>
        )
    }
}

class ResultadoPesquisa extends Component{

    render(){
        const resultado = this.props.resultadoPesquisa
        return(
            <div>
                <h1>Resultado da Pesquisa</h1>
                <div className="p-inputgroup">
                    <span className="p-inputgroup-addon">
                        Nome Completo:
                    </span>
                   <InputText
                    id='outputNomeCompletoUCPesquisaEmp'
                    value={resultado.nome_completo}
                    disabled/> 
                </div>
                <div className="p-inputgroup">
                    <span className="p-inputgroup-addon">
                        Email:
                    </span>
                    <InputText
                    id='outputEmailUCPesquisaEmp'
                    value={resultado.email}
                    disabled/>
                </div>
                <div className="p-inputgroup">
                    <span className='p-inputgroup-addon'>
                        Ocupação:
                    </span>
                    <InputText
                    id='outputOcupacaoUCPesquisaEmp'
                    value={resultado.ocupacao}
                    disabled/>
                </div>
                <div className="p-inputgroup">
                    <span className='p-inputgroup-addon'>
                        País de Origem:
                    </span>
                    <InputText
                    id='outputPaisOrigemUCPesquisaEmp'
                    value={resultado.pais_origem}
                    disabled/>
                </div>
            </div>
        )
    }
}