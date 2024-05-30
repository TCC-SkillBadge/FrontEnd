import React, { Component } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Messages } from 'primereact/messages'
import Loading from '../Loading'
import { verTodosUC } from '../../controllers/UserComumCTR'

export default class ListarUCs extends Component {
    constructor(props){
        super(props)
        this.state ={
            listaUC: [],
            msg: false
        }
    }

    verTodos = () => {
        console.log('Entrei na função verTodos() em ListaUC.js')
        const usuarioAdmin = sessionStorage.getItem('usuarioAdmin')
        if(usuarioAdmin){
            const { token, tipoUsuario } = JSON.parse(usuarioAdmin)
            verTodosUC(token, tipoUsuario).then(response => {
                if(response.sucesso){
                    this.mensagem.clear()
                    this.setState({listaUC: response.pacote})
                    this.setState({msg: false})
                }
                else{
                    this.mensagem.replace(response.pacote)
                    this.setState({msg: true})
                }
            })
        }
    }

    componentDidMount(){
        this.verTodos()
    }

    render() {
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