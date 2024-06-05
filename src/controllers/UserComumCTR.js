import axios from 'axios'

const UCServer = axios.create({
    baseURL: 'http://localhost:6002/'
})  
//'https://user-comum-tg-dd7a104138cd.herokuapp.com/'

const msgLife = 6000

export const cadastrarUC = async (E, S, N, O, P) => {
    console.log('Entrei na função cadastrarUE() em UEController')
    try{
        await UCServer.post('/cadastrar', {
            email: E,
            senha: S,
            nome_completo: N,
            ocupacao: O,
            pais_origem: P
        })
        return(
            {
                sucesso: true,
                pacote: { severity: 'success', summary: 'Cadastro realizado com sucesso', detail: 'Você já pode fazer login no sistema!', life: msgLife }
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'ServicoIndisponivel':
                    return(
                        {
                            sucesso: false,
                            pacote: {severity: 'error', summary: err.response.data.messsage, detail: 'Tente novamente mais tarde', life: msgLife}
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            pacote: { severity: 'error', summary: 'Erro no Cadastro', detail: err.response.data.message, life: msgLife }
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    pacote: { severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife }
                }
            )
        }
    }
}

export const loginUC = async (E, S) => {
    console.log('Entrei na função login() em UEController')
    try{
        const { data } = await UCServer.get('/login', {
            params: {
                email: E,
                senha: S
            }
        })
        sessionStorage.setItem('usuarioComum', JSON.stringify(data))
        dispatchEvent(new Event('storage'))
        return {sucesso: true}
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'ServicoIndisponivel':
                    return(
                        {
                            sucesso: false,
                            pacote: {severity: 'error', summary: err.response.data.messsage, detail: 'Tente novamente mais tarde', life: msgLife}
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            pacote: { severity: 'error', summary: 'Erro no Login', detail: err.response.data.message, life: msgLife }
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    pacote: { severity: 'error', summary: 'Erro Inseperado', detail: 'Tente novamente mais tarde', life: msgLife }
                }
            )
        }
    }
}

export const acessaInfoUC = async (token, tipoUsuario) => {
    console.log('Entrei na função acessaInfoUC() em UCController')
    try{
        const { data } = await UCServer.get('/acessa-info', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                tipoUsuario
            }
        })
        const entregaView = {
            email: data.email,
            nome_completo: data.nome_completo,
            ocupacao: data.ocupacao ? data.ocupacao : '----',
            pais_origem: data.pais_origem ? data.pais_origem : '----',
        }
        return(
            {
                sucesso: true,
                pacote: entregaView
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: { severity: 'error', summary: 'Erro na Acessibilidade dos Dados', detail: err.response.data.message, life: msgLife }
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: { severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife,  sticky: true, closable: false }
                }
            )
        }
    }
}

export const verTodosUC = async (token, tipoUsuario) => {
    console.log('Entrei na função verTodosUE() em UEController')
    try{
        const { data } = await UCServer.get('/ver-todos', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    tipoUsuario
                }
        })
        const entregaView = data.map(UC => {
            return {
                email: UC.email,
                nome_completo: UC.nome_completo,
                ocupacao: UC.ocupacao ? UC.ocupacao : '----',
                pais_origem: UC.pais_origem ? UC.pais_origem : '----',
            }
        })
        console.log(entregaView)
        return(
            {
                sucesso: true,
                pacote: entregaView
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                case 'ServicoIndisponivel':
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: err.response.data.messsage, detail: 'Tente novamente mais tarde', life: msgLife}
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: { severity: 'error', summary: 'Erro no Acesso à Lista de Usuários Comuns', detail: err.response.data.message, life: msgLife }
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: { severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', sticky: true, closable: false }
                }
            )
        }
    }
}

export const ADMconsultarUC = async (token, tipoUsuario, P) => {
    console.log('Entrei na função ADMconsultarUC() em UCController')
    try{
        const { data } = await UCServer.get('/consultar/adm', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                pesquisa: P,
                tipoUsuario
            }
        })
        const entregaView = data.map(UC => {
            return {
                email: UC.email,
                nome_completo: UC.nome_completo,
                ocupacao: UC.ocupacao ? UC.ocupacao : '----',
                pais_origem: UC.pais_origem ? UC.pais_origem : '----',
            }
        })
        return(
            {
                sucesso: true,
                pacote: entregaView
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                case 'ServicoIndisponivel':
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: err.response.data.messsage, detail: 'Tente novamente mais tarde', life: msgLife}
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: { severity: 'error', summary: 'Erro na Consulta', detail: err.response.data.message, life: msgLife }
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    pacote: { severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife }
                }
            )
        }
    }
}

export const EMPRconsultarUC = async (token, tipoUsuario, P) => {
    console.log('Entrei na função EMPconsultarUC() em UAController')
    try{
        const { data } = await UCServer.get('/consultar/empr', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                pesquisa: P,
                tipoUsuario
            }
        })
        const entregaView = {
            email: data.email,
            nome_completo: data.nome_completo,
            ocupacao: data.ocupacao ? data.ocupacao : '----',
            pais_origem: data.pais_origem ? data.pais_origem : '----',
        }
        return(
            {
                sucesso: true,
                pacote: entregaView
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                case 'ServicoIndisponivel':
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: err.response.data.messsage, detail: 'Tente novamente mais tarde', life: msgLife}
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: { severity: 'error', summary: 'Erro na Consulta', detail: err.response.data.message, life: msgLife }
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    pacote: { severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife }
                }
            )
        }
    }
}