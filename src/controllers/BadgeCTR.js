import axios from 'axios'

const BadgeServer = axios.create({
    baseURL: 'http://localhost:7001/'
})

const msgLife = 6000

export const cadastrarBadge = async (IMG, DESC, CRIADOR) => {
    console.log('Entrei na função cadastrarBadge() em BadgeController')
    try{
        await BadgeServer.post('/cadastrar', {
            imagem_mb: IMG,
            desc_certificacao: DESC,
            criador: CRIADOR
        })
        return(
            {
                sucesso: true,
                pacote: {severity: 'success', summary: 'Cadastro realizado com sucesso', detail: 'Você já pode consultar sua badge!', life: msgLife}
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
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
}

export const consultarBadge = async (P) => {
    console.log('Entrei na função consultarBadge() em BadgeController')
    try{
        const { data } = await BadgeServer.get('/consultar', {
            params: {
                pesquisa: P
            }
        })
        const entregaView = {
            id_badge: data.id_badge,
            imagem_mb: data.imagem_mb,
            desc_certificacao: data.desc_certificacao,
            criador: data.criador 
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
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
}