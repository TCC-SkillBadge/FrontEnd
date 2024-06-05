import axios from 'axios'

const UEServer = axios.create({
    baseURL: 'https://user-empresarial-tg-be2b1bc973b0.herokuapp.com/'
})
//''http://localhost:6003/'

const msgLife = 6000

export const validarCNPJ = async (CNPJ) => {
    console.log('Entrei na função validarNumeroCNPJ() em UEController')

    //Pega números do CNPJ
    const numerosCNPJ = [], sequenciaValidacao = [5,4,3,2,9,8,7,6,5,4,3,2], digitoVerificador1 = +CNPJ[CNPJ.length - 2], digitoVerificador2 = +CNPJ[CNPJ.length - 1], divisor = 11
    let i = 0, soma = 0, resto
    while(i < CNPJ.length - 2){
        numerosCNPJ.push(+CNPJ[i])
        i++
    }

    //Cálculo do 1º dígito verificador
    i = 0
    while(i < numerosCNPJ.length){
        soma += numerosCNPJ[i] * sequenciaValidacao[i]
        i++
    }
    resto = soma % divisor
    let result1
    if(resto < 2) result1 = 0
    else result1 = divisor - resto

    //Cálculo do 2º dígito verificador
    numerosCNPJ.push(result1)
    sequenciaValidacao.unshift(6)
    i = 0
    soma = 0
    while(i < numerosCNPJ.length){
        soma += numerosCNPJ[i] * sequenciaValidacao[i]
        i++
    }
    resto = soma % divisor
    let result2
    if(resto < 2) result2 = 0
    else result2 = divisor - resto

    //Validação dos dígitos verificadores
    if(result1 === digitoVerificador1 && result2 === digitoVerificador2){
        const { sucesso, pacote } = await validarRegistroReceitaFederal(CNPJ)
        return(
            {
                sucesso: sucesso,
                pacote: pacote
            }
        )
    }
    else{
        return(
            {
                sucesso: false,
                pacote: {severity: 'error', summary: 'Número de CNPJ Inválido', detail: 'Verifique o número digitado', life: msgLife}
            }
        )
    }
}

const validarRegistroReceitaFederal = async (CNPJ) => {
    console.log('Entrei na função validarRegistroReceitaFederal() em UEController')
    try{
        const { data } = await UEServer.get('/validarCNPJ', {
            params: {
                cnpj: CNPJ
            }
        })
        if(data.status === 'OK'){
            if(data.situacao === 'ATIVA'){
                const repasse = {
                    email: data.email,
                    nome: data.nome,
                    situacao: data.situacao,
                    logradouro: data.logradouro,
                    numero: data.numero,
                    complemento: data.complemento,
                    cep: data.cep,
                    bairro: data.bairro,
                    municipio: data.municipio,
                    telefone: data.telefone	
                }
                return(
                    {
                        sucesso: true,
                        pacote: repasse
                    }
                )
            }
            else{
                return(
                    {
                        sucesso: false,
                        pacote: {severity: 'error', summary: 'Situação Cadastral não ativa', detail: 'Verifique o número digitado', life: msgLife}
                    }
                )
            }
        }
        else{
            return(
                {
                    sucesso: false,
                    pacote: {severity: 'error', summary: 'Erro na Validação do CNPJ', detail: 'Um erro inesperado ocorreu!', life: msgLife}
                }
            )
        }
    }
    catch(err){
        console.log(err)
        if(err.response){
            return(
                {
                    sucesso: false,
                    pacote: {severity: 'error', summary: 'Erro na Validação do CNPJ', detail: err.response.data.message, life: msgLife}
                }
            )
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Serviço de Cadastro muito provavelmente Indisponível. Tente novamente mais tarde.', life: msgLife}
                }
            )
        }
    }
}

export const cadastrarUE = async (EC, SN, RS, CNPJ, CEP, L, B, M, SUP, NC) => {
    console.log('Entrei na função cadastrarUE() em UEController')
    try{
        await UEServer.post('/cadastrar', {
            email_comercial: EC,
            senha: SN,
            razao_social: RS,
            cnpj: CNPJ,
            cep: CEP,
            logradouro: L,
            bairro: B,
            municipio: M,
            suplemento: SUP,
            numero_contato: NC
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

export const loginUE = async (EC, SN) => {
    console.log('Entrei na função login() em UEController')
    try{
        const { data } = await UEServer.get('/login', {
            params: {
                email_comercial: EC,
                senha: SN
            }
        })
        sessionStorage.setItem('usuarioEmpresarial', JSON.stringify(data))
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
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
    
}

export const acessaInfoUE = async (token, tipoUsuario) => {
    console.log('Entrei na função acessaInfoUE() em UEController')
    try{
        const { data } = await UEServer.get('/acessa-info', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                tipoUsuario
            }
        })
        const entregaView = {
            razao_social: data.razao_social,
            email_comercial: data.email_comercial,
            cnpj: data.cnpj,
            cep: data.cep ? data.cep : '----',
            logradouro: data.logradouro ? data.logradouro : '----',
            bairro: data.bairro ? data.bairro : '----',
            municipio: data.municipio ? data.municipio : '----',
            suplemento: data.suplemento ? data.suplemento : '----',
            numero_contato: data.numero_contato ? data.numero_contato : '----'
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
                    pacote: {severity: 'error', summary: 'Erro na Acessibilidade dos Dados', detail: 'Tente novamente mais tarde', life: msgLife,  sticky: true, closable: false}
                }
            )
        }
    }
}

export const verTodosUE = async (token, tipoUsuario) => {
    console.log('Entrei na função verTodosUE() em UEController')
    try{
        const { data } = await UEServer.get('/ver-todos', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    tipoUsuario
                }
        })
        const entregaView = data.map(UE => {
            return {
                razao_social: UE.razao_social,
                email_comercial: UE.email_comercial,
                cnpj: UE.cnpj,
                cep: UE.cep ? UE.cep : '----',
                logradouro: UE.logradouro ? UE.logradouro : '----',
                bairro: UE.bairro ? UE.bairro : '----',
                municipio: UE.municipio ? UE.municipio : '----',
                suplemento: UE.suplemento ? UE.suplemento : '----',
                numero_contato: UE.numero_contato ? UE.numero_contato : '----'
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
                            pacote: { severity: 'error', summary: 'Erro no Acesso à Lista de Usuários Empresariais', detail: err.response.data.message, life: msgLife }
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', sticky: true, closable: false}
                }
            )
        }
    }
}

export const consultarUE = async (token, tipoUsuario, P) => {
    console.log('Entrei na função consultarUE() em UEController')
    try{
        const { data } = await UEServer.get('/consultar', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                pesquisa: P,
                tipoUsuario
            }
        })
        const entregaView = {
            razao_social: data.razao_social,
            email_comercial: data.email_comercial,
            cnpj: data.cnpj,
            cep: data.cep ? data.cep : '----',
            logradouro: data.logradouro ? data.logradouro : '----',
            bairro: data.bairro ? data.bairro : '----',
            municipio: data.municipio ? data.municipio : '----',
            suplemento: data.suplemento ? data.suplemento : '----',
            numero_contato: data.numero_contato ? data.numero_contato : '----'
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