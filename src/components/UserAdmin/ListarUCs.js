import React, { Component } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Messages } from 'primereact/messages'
import { Navigate } from 'react-router-dom'
import Loading from '../Loading'
import { verTodosUC } from '../../controllers/UserComumCTR'

export default class ListarUCs extends Component {
    constructor(props){
        super(props)
        this.state ={
            listaUC: [],
            msg: false,
            logado: true,
            destinoSaida: ""
        }
    }

    verTodos = () => {
        console.log('Entrei na função verTodos() em ListaUC.js')
        const usuarioAdmin = sessionStorage.getItem('usuarioAdmin')
        if(usuarioAdmin){
            const { token, tipoUsuario } = JSON.parse(usuarioAdmin)
            verTodosUC(token, tipoUsuario).then(response => {
                if(response.sucesso){
                    this.setState({listaUC: response.pacote})
                }
                else{
                    switch(response.caso){
                        case 'expirado':
                            alert(response.pacote)
                            this.sairConta('/login')
                            break
                        default:
                            this.mensagem.replace(response.pacote)
                            this.setState({ msg: true })
                    }
                }
            })
        }
    }

    componentDidMount(){
        this.verTodos()
    }

    sairConta = (destino) => {
        sessionStorage.removeItem('usuarioAdmin')
        dispatchEvent(new Event('storage'))
        this.setState({ logado: false, destinoSaida: destino })
    }

    render() {
        if(!this.state.logado) return <Navigate to={this.state.destinoSaida}/>
        return (
            <div className='mt-4'>
                <Messages id='mensagemListaUC' ref={(el) => this.mensagem = el}></Messages>
                {
                    !this.state.msg &&
                    (this.state.listaUC.length === 0 ? <Loading/> : <InfosUCs lista={this.state.listaUC}/>)
                }
            </div>
        )
    }
}

class InfosUCs extends Component{
    render(){
        return(
            <DataTable id='dataTableListaUC' value={this.props.lista}>
                <Column field='nome_completo' header='Nome Completo'/>
                <Column field='email' header='Email'/>
                <Column field='ocupacao' header='Ocupação'/>
                <Column field='pais_origem' header='País de Origem'/>
            </DataTable>
        )
    }
}