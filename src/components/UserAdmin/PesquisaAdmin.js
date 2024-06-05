import { Button } from 'primereact/button'
import React, { Component } from 'react'
import { InputText } from 'primereact/inputtext'
import { Messages } from 'primereact/messages'
import { Navigate } from 'react-router-dom'
import Loading from '../Loading'
import { consultarUE } from '../../controllers/UserEmpresarialCTR'
import { ADMconsultarUC } from '../../controllers/UserComumCTR'

export default class PesquisaAdmin extends Component {
    constructor(props){
        super(props)
        this.state = {
            termoPesquisa: "",
            plholder: "",
            tipoUsuario: "",
            cabecalho: "",
            resultadoPesquisa: [],
            msg: false,
            pesquisando: false,
            logado: true,
            destinoSaida: ""
        }
    }

    tipoPesquisa = {
        Comum: 'Comum',
        Empresarial: 'Empresarial'
    }

    pesquisar = async () => {
        if(this.state.termoPesquisa === ''){
            this.mensagem.replace({severity: 'error', summary: 'Erro', detail: 'Digite um termo de pesquisa'})
            return
        }
        if(this.mensagem) this.mensagem.clear()
        this.setState({resultadoPesquisa: [], pesquisando: true, msg: false})
        const usuarioAdmin = sessionStorage.getItem('usuarioAdmin')
        if(usuarioAdmin){
            const { token, tipoUsuario } = JSON.parse(usuarioAdmin)
            let resultadoPesquisaAux
            switch(this.state.tipoUsuario){
                case 'Comum':
                    resultadoPesquisaAux = await ADMconsultarUC(token, tipoUsuario, this.state.termoPesquisa)
                    break
                case 'Empresarial':
                    resultadoPesquisaAux = await consultarUE(token, tipoUsuario, this.state.termoPesquisa)
                    break
                default:
            }
            if(resultadoPesquisaAux.sucesso){
                switch(this.state.tipoUsuario){
                    case 'Comum':
                        this.setState({resultadoPesquisa: resultadoPesquisaAux.pacote, termoPesquisa: "", pesquisando: false})
                        break
                    case 'Empresarial':
                        const r = [resultadoPesquisaAux.pacote]
                        this.setState({resultadoPesquisa: r, termoPesquisa: "", pesquisando: false})
                        break
                    default:
                }
            }
            else{
                switch(resultadoPesquisaAux.caso){
                    case 'expirado':
                        alert(resultadoPesquisaAux.pacote)
                        this.sairConta('/login')
                        break
                    default:
                        this.mensagem.replace(resultadoPesquisaAux.pacote)
                        this.setState({pesquisando: false, msg: true})
                }
            }
        }  
    }

    escolherTPUsuarioC = () => {
        this.setState({plholder: "Insira o termo da busca", tipoUsuario: this.tipoPesquisa.Comum, cabecalho: "Pesquisar Usuário Comum", termoPesquisa: '', resultadoPesquisa: []})
        if(this.mensagem) this.mensagem.clear()
    }

    escolherTPUsuarioE = () => {
        this.setState({plholder: "Insira o email comercial ou a razao social do Empresa", tipoUsuario: this.tipoPesquisa.Empresarial, cabecalho: "Pesquisar Empresa", termoPesquisa: '', resultadoPesquisa: []})
        if(this.mensagem) this.mensagem.clear()
    }

    componentDidMount(){
        this.escolherTPUsuarioC()
    }

    sairConta = (destino) => {
        sessionStorage.removeItem('usuarioAdmin')
        dispatchEvent(new Event('storage'))
        this.setState({ logado: false, destinoSaida: destino })
    }

    render() {
        if(!this.state.logado) return <Navigate to={this.state.destinoSaida}/>
        return (
        <div className='grid'>
            <div className="col-2 p-4">
                <Button
                id='escolheTPUsuarioC'
                className='border-round-lg block m-1'
                label='Usuário Comum'
                onClick={this.escolherTPUsuarioC}/>
                <Button
                id='escolheTPUsuarioE'
                className='border-round-lg block m-1'
                label='Empresa'
                onClick={this.escolherTPUsuarioE}/>
            </div>
            <div className="col-10">
                <h1>{this.state.cabecalho}</h1>
                <div className='flex inline mr-5 p-1'>
                    <div className='p-inputgroup'>
                        <span className='p-inputgroup-addon'>
                            <i className='pi pi-search'></i>
                        </span>
                        <InputText
                        id='inputPesquisaAdmin'
                        placeholder={this.state.plholder}
                        value={this.state.termoPesquisa}
                        onChange={e => this.setState({ termoPesquisa: e.target.value })}></InputText>
                    </div>
                    <Button
                    id='botaoPesquisaAdmin'
                    label='Pesquisar'
                    icon='pi pi-check'
                    onClick={this.pesquisar}
                    onKeyDown={e => { if(e.key === 'Enter') this.pesquisar() }}/>
                </div>
                <Messages id='mensagemPesquisaAdmin' ref={el => this.mensagem = el}></Messages>
                <div>
                    {
                        !this.state.msg &&
                        (
                            this.state.resultadoPesquisa.length > 0 ?
                            (
                                this.state.tipoUsuario === this.tipoPesquisa.Comum ? 
                                <ResultadosUC resultadoPesquisa={this.state.resultadoPesquisa}/> : 
                                <ResultadosUE resultadoPesquisa={this.state.resultadoPesquisa}/>
                            ) : 
                            (this.state.pesquisando ? <Loading/> : null)
                        )
                    }
                </div>
            </div>
        </div>
        )
    }
}

class ResultadosUE extends Component{
    constructor(props){
        super(props)
        this.state = {
            resultadoPesquisa: []
        }
    }

    montaResultado = () => {
        this.setState({resultadoPesquisa: this.props.resultadoPesquisa})
    }

    componentDidMount(){
        this.montaResultado()
    }

    componentDidUpdate(prevProps){
        if(this.props.resultadoPesquisa !== prevProps.resultadoPesquisa){
            this.montaResultado()
        }
    }

    render(){
        let i = 0
        return(
            <div>
                <h1>Resultado da Pesquisa:</h1>
                {this.state.resultadoPesquisa.map(item => {
                    i++
                    return(
                        <div key={i} className='card mr-5'>
                            <div className='p-inputgroup'>
                                <span className='p-inputgroup-addon'>
                                    Razão Social:
                                </span>
                                <InputText
                                id={`outputRazaoSocialPesquisaAdminUE${i}`}
                                value={item.razao_social}
                                disabled/>
                            </div>
                            <div className='p-inputgroup'>
                                <span className='p-inputgroup-addon'>
                                    Email Comercial:
                                </span>
                                <InputText
                                id={`outputEmailComercialPesquisaAdminUE${i}`}
                                value={item.email_comercial}
                                disabled/>
                            </div>
                            <div className='p-inputgroup'>
                                <span className='p-inputgroup-addon'>
                                    CNPJ:
                                </span>
                                <InputText
                                id={`outputCNPJPesquisaAdminUE${i}`}
                                value={item.cnpj}
                                disabled/>
                            </div>
                            <div className='p-inputgroup'>
                                <span className='p-inputgroup-addon'>
                                    Número de Contato:
                                </span>
                                <InputText
                                id={`outputNumeroContatoPesquisaAdminUE${i}`}
                                value={item.numero_contato}
                                disabled/>
                            </div>
                            <div className='card'>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        CEP:
                                    </span>
                                    <InputText
                                    id={`outputCEPPesquisaAdminUE${i}`}
                                    value={item.cep}
                                    disabled/>
                                </div>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        Município:
                                    </span>
                                    <InputText
                                    id={`outputMunicipioPesquisaAdminUE${i}`}
                                    value={item.municipio}
                                    disabled/>
                                </div>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        Bairro:
                                    </span>
                                    <InputText
                                    id={`outputBairroPesquisaAdminUE${i}`}
                                    value={item.bairro}
                                    disabled/>
                                </div>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        Logradouro:
                                    </span>
                                    <InputText
                                    id={`outputLogradouroPesquisaAdminUE${i}`}
                                    value={item.logradouro}
                                    disabled/>
                                </div>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        Suplemento:
                                    </span>
                                    <InputText
                                    id={`outputSuplementoPesquisaAdminUE${i}`}
                                    value={item.suplemento}
                                    disabled/>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}

class ResultadosUC extends Component{
    constructor(props){
        super(props)
        this.state = {
            resultadoPesquisa: []
        }
    }

    montaResultado = () => {
        this.setState({resultadoPesquisa: this.props.resultadoPesquisa})
    }

    componentDidMount(){
        this.montaResultado()
    }

    componentDidUpdate(prevProps){
        if(this.props.resultadoPesquisa !== prevProps.resultadoPesquisa){
            this.montaResultado()
        }
    
    }

    render(){
        let i = 0
        return(
            <div>
                <h1>Resultado da Pesquisa:</h1>
                {this.state.resultadoPesquisa.map(item => {
                    i++
                    return(
                        <div key={i} className='card mr-5 mb-3'>
                            <div className='p-inputgroup'>
                                <span className='p-inputgroup-addon'>
                                    Email:
                                </span>
                                <InputText
                                id={`outputEmailPesquisaAdminUC${i}`}
                                value={item.email}
                                disabled/>
                            </div>
                            <div className='p-inputgroup'>
                                <span className='p-inputgroup-addon'>
                                    Nome Completo:
                                </span>
                                <InputText
                                id={`outputNomeCompletoPesquisaAdminUC${i}`}
                                value={item.nome_completo}
                                disabled/>
                            </div>
                            <div className='p-inputgroup'>
                                <span className='p-inputgroup-addon'>
                                    Ocupação:
                                </span>
                                <InputText
                                id={`outputOcupacaoPesquisaAdminUC${i}`}
                                value={item.ocupacao}
                                disabled/>
                            </div>
                            <div className='p-inputgroup'>
                                <span className='p-inputgroup-addon'>
                                    País de Origem:
                                </span>
                                <InputText
                                id={`outputPaisOrigemPesquisaAdminUC${i}`}
                                value={item.pais_origem}
                                disabled/>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}