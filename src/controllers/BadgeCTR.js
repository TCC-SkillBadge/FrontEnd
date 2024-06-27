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