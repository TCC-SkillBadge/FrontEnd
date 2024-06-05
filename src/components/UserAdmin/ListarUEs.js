import React, { Component } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Messages } from 'primereact/messages'
import { Navigate } from 'react-router-dom'
import Loading from '../Loading'
import { verTodosUE } from '../../controllers/UserEmpresarialCTR'

export default class ListarUEs extends Component {
    constructor(props){
        super(props)
        this.state ={
            listaUE: [],
            msg: false,
            logado: true,
            destinoSaida: ""
        }
    }

    verTodos = () => {
        console.log('Entrei na função verTodos() em ListaUE.js')
        const usuarioAdmin = sessionStorage.getItem('usuarioAdmin')
        if(usuarioAdmin){
            const { token, tipoUsuario } = JSON.parse(usuarioAdmin)
            verTodosUE(token, tipoUsuario).then(response => {
                if(response.sucesso){
                    this.mensagem.clear()
                    this.setState({listaUE: response.pacote})
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
                <Messages id='mensagemListaUE' ref={(el) => this.mensagem = el}></Messages>
                {
                    !this.state.msg &&
                    (this.state.listaUE.length === 0 ? <Loading/> : <InfosUEs lista={this.state.listaUE}/>)
                }
            </div>
        )
    }
}

class InfosUEs extends Component{
    render(){
        return(
            <DataTable id='dataTableListaUE' value={this.props.lista}>
                <Column field='razao_social' header='Razão Social'/>
                <Column field='email_comercial' header='Email Comercial'/>
                <Column field='cnpj' header='CNPJ'/>
                <Column field='cep' header='CEP'/>
                <Column field='logradouro' header='Logradouro'/>
                <Column field='suplemento' header='Suplemento'/>
                <Column field='bairro' header='Bairro'/>
                <Column field='municipio' header='Município'/>
                <Column field='numero_contato' header='Número de Contato'/>
            </DataTable>
        )
        
    }
}