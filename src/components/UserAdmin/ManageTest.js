import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Navbar from "../Navbar";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { confirmPopup } from 'primereact/confirmpopup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RadioButton } from 'primereact/radiobutton';
import ClipLoader from "react-spinners/ClipLoader";
import { animated, useTransition } from 'react-spring';
import { Messages } from 'primereact/messages';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import '../../styles/ManageTest.css';

const baseUrlServicosGerais = axios.create({
    baseURL: 'http://localhost:6004/'
});

export const ManageTest = () => {
    const [questoes, setQuestoes] = useState([]);
    const [alternativasM, setAlternativasM] = useState([]);
    const [alternativasMV, setAlternativasMV] = useState([]);
    const [alternativasR, setAlternativasR] = useState([]);
    const [softSkills, setSoftSkills] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvo, setSalvo] = useState(true);
    const [countComeco, setCountComeco] = useState(0);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    let messages = useRef(null);

    const token = sessionStorage.getItem('token');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');

    useEffect(() => {
        if(!token || !tipoUsuario) {
            toast.error('Usuário não autenticado! Você não conseguirá fazer o que quer enquanto não se autenticar.');
        }

        const fetchSoftSkills = async () => {
            try{
                const response = (await baseUrlServicosGerais.get('/softskills/listar',
                    { 
                        headers: { Authorization: `Bearer ${token}` },
                        params: { tipoUsuario }
                    }
                )).data;
                return Promise.resolve(response);
            }
            catch(error){
                let msg
                if(error.response) msg = error.response.data.message
                else if(error.request) msg = 'Erro ao tentar acessar o servidor'
                return Promise.reject(msg);
            }
        };

        const fetchTeste = async (SSs) => {
            try{
                const response = (await baseUrlServicosGerais.get('/teste/fetch',
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    params: { tipoUsuario }
                }    
                )).data;
                const {
                    questoes,
                    alternativasMultiplaEscolha,
                    alternativasRankeamento,
                    alternativasMultiplaEscolhaComValores
                } = response;
                return Promise.resolve({
                    questoes,
                    alternativasMultiplaEscolha,
                    alternativasRankeamento,
                    alternativasMultiplaEscolhaComValores,
                    SSs
                });
            }
            catch(error){
                let msg
                if(error.response) msg = error.response.data.message
                else if(error.request) msg = 'Erro ao tentar acessar o servidor'
                return Promise.reject(msg);
            }
        }

        fetchSoftSkills()
        .then((response) => fetchTeste(response))
        .then((response) => {
            const {
                questoes,
                alternativasMultiplaEscolha,
                alternativasRankeamento,
                alternativasMultiplaEscolhaComValores,
                SSs
            } = response;
            setSoftSkills(SSs);
            setQuestoes(questoes);
            setAlternativasM(alternativasMultiplaEscolha);
            setAlternativasR(alternativasRankeamento);
            setAlternativasMV(alternativasMultiplaEscolhaComValores);
        })
        .catch((error) => messages.replace({severity: 'error', summary: 'Erro', detail: `${error}`, sticky: true, closable: false}))
        .finally(() => setCarregando(false));

        window.onresize = () => {
            setScreenWidth(window.innerWidth);
        };

        return () => {
            window.onresize = null;
        };
    }, []);

    useEffect(() => {
        if(salvo && (countComeco > 1)) setSalvo(false);
        if(countComeco <= 1) setCountComeco(countComeco + 1);
    }, [questoes, alternativasM, alternativasR, alternativasMV]); // eslint-disable-line

    useEffect(() => {
        if(!salvo){
            if(!window.onbeforeunload){
                window.onbeforeunload = (e) => {
                    e.preventDefault();
                    e.returnValue = '';
                };  
            }
        }
        else{
            if(window.onbeforeunload) window.onbeforeunload = null;
        }

        return () => { if(window.onbeforeunload) window.onbeforeunload = null };
    }, [salvo]);

    const adicionarQuestaoM = (idSS) => {
        const newQuestoes = [...questoes];
        newQuestoes.push({
            id_questao: questoes.length + 1,
            enunciado_questao: '',
            tipo_questao: 'multipla_escolha',
            valor_questao: 0,
            id_soft_skill: idSS,
        });
        setQuestoes(newQuestoes);
    };

    const adicionarQuestaoR = (idSS) => {
        const newQuestoes = [...questoes];
        newQuestoes.push({
            id_questao: questoes.length + 1,
            enunciado_questao: '',
            tipo_questao: 'rankeamento',
            valor_questao: 0,
            id_soft_skill: idSS,
        });
        setQuestoes(newQuestoes);
    };

    const adicionarQuestaoMV = (idSS) => {
        const newQuestoes = [...questoes];
        newQuestoes.push({
            id_questao: questoes.length + 1,
            enunciado_questao: '',
            tipo_questao: 'multipla_escolha_com_valores',
            valor_questao: 0,
            id_soft_skill: idSS,
        });
        setQuestoes(newQuestoes);
    };

    const confirmarRemoverQuestao = (e, idQ, tpQ) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Deseja mesmo remover essa questão?',
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => removerQuestao(idQ, tpQ),
        });
    };

    const removerQuestao = (idQ, tpQ) => {
        const newQuestoes = questoes.filter((questao) => questao.id_questao !== idQ);
        for(let i = 0; i < newQuestoes.length; i++){
            if(newQuestoes[i].id_questao > idQ){
                newQuestoes[i].id_questao -= 1;
            }
        }
        setQuestoes(newQuestoes);

        const alters = [
            { tpQ: 'multipla_escolha', alts: [...alternativasM], func: setAlternativasM },
            { tpQ: 'rankeamento', alts: [...alternativasR], func: setAlternativasR },
            { tpQ: 'multipla_escolha_com_valores', alts: [...alternativasMV], func: setAlternativasMV }
        ];
        for(let i = 0; i < alters.length; i++){
            if(alters[i].tpQ === tpQ){
                alters[i].alts = alters[i].alts.filter((alternativa) => alternativa.id_questao !== idQ);
                break;
            };
        };
        for(let i = 0; i < alters.length; i++){
            for(let j = 0; j < alters[i].alts.length; j++){
                if(alters[i].alts[j].id_questao > idQ){
                    alters[i].alts[j].id_questao -= 1;
                }
            }
        };
        for(let i = 0; i < alters.length; i++){
            alters[i].func(alters[i].alts);
        }
    };

    const adicionarAlternativaM = (idQ) => {
        const newAlternativasM = [...alternativasM];
        newAlternativasM.push({
            id_questao: idQ,
            id_alternativa: alternativasM.filter((alternativa) => alternativa.id_questao === idQ).length + 1,
            texto_alternativa: '',
            correta: false,
        });
        setAlternativasM(newAlternativasM);
    };

    const adicionarAlternativaR = (idQ) => {
        const newAlternativasR = [...alternativasR];
        newAlternativasR.push({
            id_questao: idQ,
            id_alternativa: alternativasR.filter((alternativa) => alternativa.id_questao === idQ).length + 1,
            texto_alternativa: '',
            valor_alternativa: 0,
        });
        setAlternativasR(newAlternativasR);
    };

    const adicionarAlternativaMV = (idQ) => {
        const newAlternativasMV = [...alternativasMV];
        newAlternativasMV.push({
            id_questao: idQ,
            id_alternativa: alternativasMV.filter((alternativa) => alternativa.id_questao === idQ).length + 1,
            texto_alternativa: '',
            porcentagem: 0,
        });
        setAlternativasMV(newAlternativasMV);
    };

    const confirmarRemoverAlternativa = (e, idQ, idA, tpQ) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Deseja mesmo remover essa alternativa?',
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => removerAlternativa(idQ, idA, tpQ),
        });
    };

    const removerAlternativa = (idQ, idA, tpQ) => {
        let newAlternativas, func;
        switch(tpQ){
            case 'multipla_escolha':
                newAlternativas = alternativasM.filter((alternativa) => alternativa.id_questao !== idQ || alternativa.id_alternativa !== idA);
                func = setAlternativasM;
                break;
            case 'rankeamento':
                newAlternativas = alternativasR.filter((alternativa) => alternativa.id_questao !== idQ || alternativa.id_alternativa !== idA);
                func = setAlternativasR;
                break;
            case 'multipla_escolha_com_valores':
                newAlternativas = alternativasMV.filter((alternativa) => alternativa.id_questao !== idQ || alternativa.id_alternativa !== idA);
                func = setAlternativasMV;
                break;
            default:
        };
        for(let i = 0; i < newAlternativas.length; i++){
            if(newAlternativas[i].id_questao === idQ && newAlternativas[i].id_alternativa > idA){
                newAlternativas[i].id_alternativa -= 1;
            }
        };
        func(newAlternativas);
    };

    const confirmarSalvarAlteracoes = (e) => {
        confirmDialog({
            target: e.currentTarget,
            message: 'Deseja mesmo salvar as alterações feitas?',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: salvarAlteracoes,
        });
    };

    const salvarAlteracoes = async () => {
        if(!realizarVerificacoes()) return;
        const salvando = toast.loading('Salvando Alterações...');
        baseUrlServicosGerais.post('/teste/gerir', {
            questoes: questoes,
            alternativasMultiplaEscolha: alternativasM,
            alternativasRankeamento: alternativasR,
            alternativasMultiplaEscolhaComValores: alternativasMV
        },
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { tipoUsuario }
        })
        .then(() => {
            toast.update(salvando, {
                render: 'Alterações salvas com sucesso!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });
            setSalvo(true);
        })
        .catch((error) => {
            let msg
            if(error.response) msg = error.response.data.message
            else if(error.request) msg = 'Erro ao tentar acessar o servidor'
            toast.update(salvando, {
                render: `${msg}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        });
    };

    const realizarVerificacoes = () => {
        for(let i = 0; i < softSkills.length; i++){
            const questsSS = questoes.filter((questao) => questao.id_soft_skill === softSkills[i].id_soft_skill);
            for(let j = 0; j < questsSS.length; j++){
                if(questsSS[j].enunciado_questao === ''){
                toast.error(`A questão [${j + 1}] da Soft Skill [${softSkills[i].nome_soft_skill}] não possui enunciado!`, {
                    autoClose: 5000
                });
                    return false;
                }
                if(questsSS[j].valor_questao === 0){
                    toast.error(`A questão [${j + 1}] da Soft Skill [${softSkills[i].nome_soft_skill}] não possui valor!`, {
                        autoClose: 5000
                    });
                    return false;
                }
                let alts;
                switch(questsSS[j].tipo_questao){
                    case 'multipla_escolha':
                        alts = alternativasM.filter((alternativa) => alternativa.id_questao === questsSS[j].id_questao);
                        break;
                    case 'rankeamento':
                        alts = alternativasR.filter((alternativa) => alternativa.id_questao === questsSS[j].id_questao);
                        break;
                    case 'multipla_escolha_com_valores':
                        alts = alternativasMV.filter((alternativa) => alternativa.id_questao === questsSS[j].id_questao);
                        break;
                    default:
                };
                if(alts.length < 2){
                    toast.error(`A questão [${j + 1}] da Soft Skill [${softSkills[i].nome_soft_skill}] precisa possuir no mínimo 2 alternativas!`, {
                        autoClose: 5000
                    });
                    return false;
                }
                for(let k = 0; k < alts.length; k++){
                    if(alts[k].texto_alternativa === ''){
                        toast.error(`A alternativa [${k + 1}] da questão [${j + 1}] da Soft Skill [${softSkills[i].nome_soft_skill}] não possui texto!`, {
                            autoClose: 5000
                        });
                        return false;
                    }
                    if(questsSS[j].tipo_questao === 'multipla_escolha'){
                        for(let l = 0; l < alts.length; l++){
                            if(alts[l].correta){
                                break;
                            }
                            if(l === alts.length - 1){
                                toast.error(`A questão [${j + 1}] da Soft Skill [${softSkills[i].nome_soft_skill}] não possui alternativa correta!`, {
                                    autoClose: 5000
                                });
                                return false;
                            }
                        }
                    }
                    if(questsSS[j].tipo_questao === 'rankeamento' && alts[k].valor_alternativa === 0){
                        toast.error(`A alternativa [${k + 1}] da questão [${j + 1}] da Soft Skill [${softSkills[i].nome_soft_skill}] não possui valor!`, {
                            autoClose: 5000
                        });
                        return false;
                    }
                    if(questsSS[j].tipo_questao === 'multipla_escolha_com_valores' && alts[k].porcentagem === 0){
                        toast.error(`A alternativa [${k + 1}] da questão [${j + 1}] da Soft Skill [${softSkills[i].nome_soft_skill}] não possui porcentagem!`, {
                            autoClose: 5000
                        });
                        return false;
                    }
                };
            }
        }
        return true;
    };

    const handleChangeEnunciado = (e, idQ) => {
        const newQuestoes = [...questoes];
        newQuestoes[
            newQuestoes.findIndex((questao) => 
                questao.id_questao === idQ
            )
        ].enunciado_questao = e.target.value;
        setQuestoes(newQuestoes);
    };

    const handleChangeValor = (e, idQ) => {
        const newQuestoes = [...questoes];
        newQuestoes[
            newQuestoes.findIndex((questao) =>
                questao.id_questao === idQ
            )
        ].valor_questao = parseFloat(e.target.value);
        setQuestoes(newQuestoes);
    };

    const handleChangeTextoAlternativa = (e, idQ, idA, tpQ) => {
        let newAlternativas, func;
        switch(tpQ){
            case 'multipla_escolha':
                newAlternativas = [...alternativasM];
                func = setAlternativasM;
                break;
            case 'rankeamento':
                newAlternativas = [...alternativasR];
                func = setAlternativasR;
                break;
            case 'multipla_escolha_com_valores':
                newAlternativas = [...alternativasMV];
                func = setAlternativasMV;
                break;
            default:
        };
        newAlternativas[
            newAlternativas.findIndex((alternativa) => 
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].texto_alternativa = e.target.value;
        func(newAlternativas);
    };

    const handleChangeValorAlternativa = (e, idQ, idA) => {
        const newAlternativasR = [...alternativasR];
        newAlternativasR[
            newAlternativasR.findIndex((alternativa) =>
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].valor_alternativa = parseInt(e.target.value);
        setAlternativasR(newAlternativasR);
    };

    const handleChangePorcentagemAlternativa = (e, idQ, idA) => {
        const newAlternativasMV = [...alternativasMV];
        newAlternativasMV[
            newAlternativasMV.findIndex((alternativa) =>
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].porcentagem = parseInt(e.target.value);
        setAlternativasMV(newAlternativasMV);
    };

    const handleChangeCorreta = (idQ, idA) => {
        const newAlternativasM = [...alternativasM];
        for(let i = 0; i < newAlternativasM.length; i++){
            if((newAlternativasM[i].id_questao === idQ) && (newAlternativasM[i].correta)){
                newAlternativasM[i].correta = false;
            }
        }
        const alt = newAlternativasM[
                        newAlternativasM.findIndex((alternativa) =>
                            alternativa.id_questao === idQ && alternativa.id_alternativa === idA
                        )
                    ];
        alt.correta = true;
        setAlternativasM(newAlternativasM);
    };

    const layoutBotoesAdd = () => {
        if(screenWidth > 1100){
            return 'flex flex-row justify-content-center';
        }
        else{
            return 'flex flex-column align-items-center';
        }
    };

    return (
        <div>
            <Navbar/>
            <div className='m-test-box'>
                <h1>Gerir Avaliação de Competências</h1>
                <Divider/>
                <div className='flex justify-content-center'>
                    <Messages ref={(el) => messages = el}/>
                    <ClipLoader color='#F8F8FF' loading={carregando} size={150}/>
                </div>
                <div>
                    {
                        softSkills.map((softSkill) => {
                            return (
                                <div key={softSkill.id_soft_skill} className='m-test-skill-box'>
                                    <h2>{softSkill.nome_soft_skill}</h2>
                                    <Quests
                                    questoes={questoes.filter((questao) => questao.id_soft_skill === softSkill.id_soft_skill)}
                                    alternativasM={alternativasM}
                                    alternativasR={alternativasR}
                                    alternativasMV={alternativasMV}
                                    adicionarAlternativaM={adicionarAlternativaM}
                                    adicionarAlternativaR={adicionarAlternativaR}
                                    adicionarAlternativaMV={adicionarAlternativaMV}
                                    confirmarRemoverQuestao={confirmarRemoverQuestao}
                                    confirmarRemoverAlternativa={confirmarRemoverAlternativa}
                                    handleChangeEnunciado={handleChangeEnunciado}
                                    handleChangeValor={handleChangeValor}
                                    handleChangeTextoAlternativa={handleChangeTextoAlternativa}
                                    handleChangeCorreta={handleChangeCorreta}
                                    handleChangeValorAlternativa={handleChangeValorAlternativa}
                                    handleChangePorcentagemAlternativa={handleChangePorcentagemAlternativa}
                                    screenWidth={screenWidth}/>
                                    <div className={layoutBotoesAdd() + ' mt-4'}>
                                        <button
                                        id='btn-add-qm'
                                        className='btn mb-3'
                                        onClick={() => adicionarQuestaoM(softSkill.id_soft_skill)}>
                                            <i className='pi pi-plus'/> Múltipla Escolha
                                        </button>
                                        <button
                                        id='btn-add-qmv'
                                        className='btn mb-3'
                                        onClick={() => adicionarQuestaoMV(softSkill.id_soft_skill)}>
                                            <i className='pi pi-plus'/> Múltipla Escolha com Valores
                                        </button>
                                        <button
                                        id='btn-add-qr'
                                        className='btn mb-3'
                                        onClick={() => adicionarQuestaoR(softSkill.id_soft_skill)}>
                                            <i className='pi pi-plus'/> Rankeamento
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    }
                    {
                        questoes.length > 0 &&
                        <div>
                            <Divider/>
                            <div className='flex justify-content-center mt-4'>
                                <button
                                className='btn btn-success'
                                onClick={e => confirmarSalvarAlteracoes(e)}>
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"/>
            <ConfirmPopup/>
            <ConfirmDialog
            closable={false}
            pt={{
                footer: {className: 'flex justify-content-center confirm-d-back'},
                content: {className: 'confirm-d-back'},
                header: {className: 'confirm-d-back'},
            }}/>
        </div>
    );
};

const Quests = (props) => {
    const transicao = useTransition(props.questoes, {
        from: {opacity: 0, transform: 'translate3d(0, -40px, 0)'},
        enter: {opacity: 1, transform: 'translate3d(0, 0, 0)'},
        leave: {opacity: 0, transform: 'translate3d(0, -40px, 0)'},
        config: {duration: 300},
    });

    const escolherEstilo = (tpQ) => {
        switch(tpQ){
            case 'multipla_escolha':
                return 'me-quest-box';
            case 'rankeamento':
                return 'r-quest-box';
            case 'multipla_escolha_com_valores':
                return 'mv-quest-box';
            default:
        };
    };

    const montarAlternativas = (item) => {
        switch(item.tipo_questao){
            case 'multipla_escolha':
                return (
                    <AlternativesME
                    alternativasM={props.alternativasM.filter((alternativa) => alternativa.id_questao === item.id_questao)}
                    handleChangeTextoAlternativa={props.handleChangeTextoAlternativa}
                    handleChangeCorreta={props.handleChangeCorreta}
                    confirmarRemoverAlternativa={props.confirmarRemoverAlternativa}
                    tpQ={item.tipo_questao}/>
                );
            case 'rankeamento':
                return (
                    <AlternativesR
                    alternativasR={props.alternativasR.filter((alternativa) => alternativa.id_questao === item.id_questao)}
                    handleChangeTextoAlternativa={props.handleChangeTextoAlternativa}
                    handleChangeValorAlternativa={props.handleChangeValorAlternativa}
                    confirmarRemoverAlternativa={props.confirmarRemoverAlternativa}
                    tpQ={item.tipo_questao}
                    screenWidth={props.screenWidth}/>
                );
            case 'multipla_escolha_com_valores':
                return (
                    <AlternativesMV
                    alternativasMV={props.alternativasMV.filter((alternativa) => alternativa.id_questao === item.id_questao)}
                    handleChangeTextoAlternativa={props.handleChangeTextoAlternativa}
                    handleChangePorcentagemAlternativa={props.handleChangePorcentagemAlternativa}
                    confirmarRemoverAlternativa={props.confirmarRemoverAlternativa}
                    tpQ={item.tipo_questao}
                    screenWidth={props.screenWidth}/>
                );
            default:
        };
    };

    const adicionarAlternativa = (item) => {
        switch(item.tipo_questao){
            case 'multipla_escolha':
                return props.adicionarAlternativaM(item.id_questao);
            case 'rankeamento':
                return props.adicionarAlternativaR(item.id_questao);
            case 'multipla_escolha_com_valores':
                return props.adicionarAlternativaMV(item.id_questao);
            default:
        };
    };

    const valorTipoQuestao = (tpQ) => {
        switch(tpQ){
            case 'multipla_escolha':
                return 'Múltipla Escolha';
            case 'rankeamento':
                return 'Rankeamento';
            case 'multipla_escolha_com_valores':
                return 'Múltipla Escolha com Valores';
            default:
        };
    };

    const layoutTipoQuestao = (tpQ) => {
        switch(tpQ){
            case 'multipla_escolha':
                return (
                    {
                        enunciado: 'flex flex-column xl:col-8 lg:col-6 md:col-12 sm:col-12',
                        valorEtipo: 'flex flex-column xl:col-4 lg:col-6 md:col-12 sm:col-12'
                    }
                );
            case 'rankeamento':
                return (
                    {
                        enunciado: 'flex flex-column xl:col-8 lg:col-6 md:col-12 sm:col-12',
                        valorEtipo: 'flex flex-column xl:col-4 lg:col-6 md:col-12 sm:col-12'
                    }
                );
            case 'multipla_escolha_com_valores':
                return (
                    {
                        enunciado: 'flex flex-column xl:col-7 lg:col-5 md:col-12 sm:col-12',
                        valorEtipo: 'flex flex-column xl:col-5 lg:col-7 md:col-12 sm:col-12'
                    }
                );
            default:
        };
    }

    return (
        <div>
            {
                transicao((style, item) =>
                    item &&
                    <animated.div
                    style={style}
                    className={escolherEstilo(item.tipo_questao)}
                    key={item.id_questao}>
                        <div className='flex justify-content-between'>
                            <h3>Questão {props.questoes.findIndex(questao => questao.id_questao === item.id_questao) + 1}</h3>
                            <button
                            className='btn btn-danger'
                            onClick={e => props.confirmarRemoverQuestao(e, item.id_questao, item.tipo_questao)}>
                                X
                            </button>
                        </div>
                        <div className='grid align-items-center mt-3 mb-3'>
                            <div className={layoutTipoQuestao(item.tipo_questao).enunciado}>
                                <label>Enunciado:</label>
                                <InputTextarea
                                value={item.enunciado_questao}
                                onChange={e => props.handleChangeEnunciado(e, item.id_questao)}/>  
                            </div>
                            <div className={layoutTipoQuestao(item.tipo_questao).valorEtipo}>
                                <div className='p-inputgroup mb-2'>
                                    <span className='p-inputgroup-addon'>
                                        Tipo de Questão:
                                    </span>
                                    <InputText
                                    className='text-center'
                                    style={{fontWeight: 'bold'}}
                                    value={valorTipoQuestao(item.tipo_questao)}
                                    disabled/>
                                </div>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        Valor da Questão:
                                    </span>
                                    <InputText
                                    className='text-center'
                                    type='number'
                                    step={1}
                                    min={0}
                                    value={item.valor_questao}
                                    onChange={e => props.handleChangeValor(e, item.id_questao)}/>
                                </div>
                            </div>
                        </div>
                        <div className='mb-4'>
                            {montarAlternativas(item)}
                        </div>
                        <div className='flex justify-content-center'>
                            <button
                            className='btn btn-primary'
                            onClick={() => adicionarAlternativa(item)}>
                                <i className='pi pi-plus'/> Alternativa
                            </button>
                        </div>
                    </animated.div>
                )
            }
        </div>
    );
};

const AlternativesME = (props) => {
    const transicao = useTransition(props.alternativasM, {
        from: {opacity: 0, transform: 'scale(0.5)'},
        enter: {opacity: 1, transform: 'scale(1)'},
        leave: {opacity: 0, transform: 'translate3d(0, -40px, 0)'},
        config: {duration: 300},
    });

    return (
        <div>
            {
                transicao((style, item) =>
                    item &&
                    <animated.div
                    style={style}
                    className='flex flex-row align-items-center mb-3'
                    key={item.id_alternativa}>
                        <i className='pi pi-circle-on mr-4'/>
                        <InputTextarea
                        className='w-6 mr-3'
                        value={item.texto_alternativa}
                        onChange={e => props.handleChangeTextoAlternativa(e, item.id_questao, item.id_alternativa, props.tpQ)}/>
                        <div className='mr-2'>
                            <RadioButton
                            className='mr-2'
                            inputId={`rbCorreta-${item.id_questao}`}
                            checked={item.correta}
                            onChange={() => props.handleChangeCorreta(item.id_questao, item.id_alternativa)}/>
                            <label htmlFor={`rbCorreta-${item.id_questao}`}>Correta</label>
                        </div>
                        <button
                        className='btn btn-danger'
                        onClick={e => props.confirmarRemoverAlternativa(e, item.id_questao, item.id_alternativa, props.tpQ)}>
                            X
                        </button>
                    </animated.div>
                )
            }
        </div>
    );
};

const AlternativesMV = (props) => {
    const transicao = useTransition(props.alternativasMV, {
        from: {opacity: 0, transform: 'scale(0.5)'},
        enter: {opacity: 1, transform: 'scale(1)'},
        leave: {opacity: 0, transform: 'translate3d(0, -40px, 0)'},
        config: {duration: 300},
    });

    return (
        <div>
            {
                transicao((style, item) =>
                    item &&
                    <animated.div
                    style={style}
                    className='flex flex-row align-items-center mb-3'
                    key={item.id_alternativa}>
                        <i className='pi pi-circle-on mr-4'/>
                        <InputTextarea
                        className='w-6 mr-3'
                        value={item.texto_alternativa}
                        onChange={e => props.handleChangeTextoAlternativa(e, item.id_questao, item.id_alternativa, props.tpQ)}/>
                        <div className='flex mr-2'>
                            <div className='p-inputgroup max-w-15rem'>
                            <span className='p-inputgroup-addon'>
                                {props.screenWidth > 1100 ? 'Porcentagem da Nota:' : '%:'}
                            </span>
                            <InputText
                            className='text-center max-w-4rem'
                            type='number'
                            value={item.porcentagem}
                            step={1}
                            min={0}
                            max={100}
                            onChange={e => props.handleChangePorcentagemAlternativa(e, item.id_questao, item.id_alternativa)}/>
                            </div>
                        </div>
                        <button
                        className='btn btn-danger'
                        onClick={e => props.confirmarRemoverAlternativa(e, item.id_questao, item.id_alternativa, props.tpQ)}>
                            X
                        </button>
                    </animated.div>
                )
            }
        </div>
    );
};

const AlternativesR = (props) => {
    const transicao = useTransition(props.alternativasR, {
        from: {opacity: 0, transform: 'scale(0.5)'},
        enter: {opacity: 1, transform: 'scale(1)'},
        leave: {opacity: 0, transform: 'translate3d(0, -40px, 0)'},
        config: {duration: 300},
    });

    return (
        <div>
            {
                transicao((style, item) =>
                    item &&
                    <animated.div
                    style={style}
                    className='flex flex-row align-items-center mb-3'
                    key={item.id_alternativa}>
                        <i className='pi pi-circle-on mr-4'/>
                        <InputTextarea
                        className='w-6 mr-3'
                        value={item.texto_alternativa}
                        onChange={e => props.handleChangeTextoAlternativa(e, item.id_questao, item.id_alternativa, props.tpQ)}/>
                        <div className='flex mr-2'>
                            <div className='p-inputgroup max-w-15rem'>
                            <span className='p-inputgroup-addon'>
                                {props.screenWidth > 1100 ? 'Valor da Alternativa:' : 'V:'}
                            </span>
                            <InputText
                            className='text-center max-w-4rem'
                            type='number'
                            value={item.valor_alternativa}
                            step={1}
                            min={0}
                            onChange={e => props.handleChangeValorAlternativa(e, item.id_questao, item.id_alternativa)}/>
                            </div>
                        </div>
                        <button
                        className='btn btn-danger'
                        onClick={e => props.confirmarRemoverAlternativa(e, item.id_questao, item.id_alternativa, props.tpQ)}>
                            X
                        </button>
                    </animated.div>
                )
            }
        </div>
    );
};

export default ManageTest;