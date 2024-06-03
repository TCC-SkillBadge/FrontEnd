import axios from 'axios'

const UCServer = axios.create({
    baseURL: 'https://user-admin-tg-7408f5404851.herokuapp.com/'
})
//'http://localhost:6001/'

const msgLife = 6000

export const cadastrarUA = async (EA, S, NA, CAR, COD) => {
    console.log('Entrei na função cadastrarUA() em UAController')
    try{
        await UCServer.post('/cadastrar', {
            email_admin: EA,
            senha: S,
            nome_admin: NA,
            cargo: CAR,
            codigo_validacao: COD
        })
        return(
            {
                sucesso: true,
                pacote: {severity: 'success', summary: 'Cadastro realizado com sucesso', detail: 'Você já pode fazer login no sistema!', life: msgLife}
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
                            pacote: {severity: 'error', summary: 'Erro no Cadastro', detail: err.response.data.message, life: msgLife}
                        }
                    ) 
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
}

export const loginUA = async (E, S) => {
    console.log('Entrei na função login() em UEController')
    try{
        const { data } = await UCServer.get('/login', {
            params: {
                email_admin: E,
                senha: S
            }
        })
        console.log(data)
        sessionStorage.setItem('usuarioAdmin', JSON.stringify(data))
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
                            pacote: {severity: 'error', summary: 'Erro no Login', detail: err.response.data.message, life: msgLife}
                        }
                    ) 
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }   
}

export const acessaInfoUA = async (token, tipoUsuario) => {
    console.log('Entrei na função acessaInfoUA() em UAController')
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
            email_admin: data.email_admin,
            nome_admin: data.nome_admin,
            cargo: data.cargo ? data.cargo : '----',
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
                            pacote: {severity: 'error', summary: 'Erro na Acessibilidade dos Dados', detail: err.response.data.message, life: msgLife,  sticky: true, closable: false}
                        }
                    )   
        }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife,  sticky: true, closable: false}
                }
            )
        }  
    }
}