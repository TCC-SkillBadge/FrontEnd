import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Navbar from "../Navbar";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
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
    const userInfo = sessionStorage.getItem('userInfo');

    useEffect(() => {
        if(!token || !tipoUsuario || !userInfo){
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

    const gerarIdQuestao = () => {
        if(questoes.length === 0) return 1;
        else{
            let max = 0;
            for(let i = 0; i < questoes.length; i++){
                if(questoes[i].id_questao > max){
                    max = questoes[i].id_questao;
                }
            }
            return max + 1;
        }
    };

    const adicionarQuestao = (idSS, tpQ) => {
        const newQuestoes = [...questoes];
        let obj = {
            id_questao: gerarIdQuestao(),
            id_soft_skill: idSS,
            enunciado_questao: '',
            valor_questao: 0,
            tipo_questao: '',
        };
        switch(tpQ){
            case 'ME':
                obj.tipo_questao = 'multipla_escolha';
                break;
            case 'R':
                obj.tipo_questao = 'rankeamento';
                break;
            case 'MV':
                obj.tipo_questao = 'multipla_escolha_com_valores';
                break;
            default:
        }
        newQuestoes.push(obj);
        setQuestoes(newQuestoes);
    }

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
        setQuestoes(newQuestoes);

        switch(tpQ){
            case 'multipla_escolha':
                setAlternativasM(alternativasM.filter((alternativa) => alternativa.id_questao !== idQ));
                break;
            case 'rankeamento':
                setAlternativasR(alternativasR.filter((alternativa) => alternativa.id_questao !== idQ));
                break;
            case 'multipla_escolha_com_valores':
                setAlternativasMV(alternativasMV.filter((alternativa) => alternativa.id_questao !== idQ));
                break;
            default:
        };
    };

    const gerarIdAlternativa = (idQ, tpQ) => {
        let alternativas;
        switch(tpQ){
            case 'multipla_escolha':
                alternativas = alternativasM.filter((alternativa) => alternativa.id_questao === idQ);
                break;
            case 'rankeamento':
                alternativas = alternativasR.filter((alternativa) => alternativa.id_questao === idQ);
                break;
            case 'multipla_escolha_com_valores':
                alternativas = alternativasMV.filter((alternativa) => alternativa.id_questao === idQ);
                break;
            default:
        };
        if(alternativas.length === 0) return 1;
        else{
            let max = 0;
            for(let i = 0; i < alternativas.length; i++){
                if(alternativas[i].id_alternativa > max){
                    max = alternativas[i].id_alternativa;
                }
            }
            return max + 1;
        }
    };

    const adicionarAlternativa = (idQ, tpQ) => {
        let obj = {
            id_questao: idQ,
            id_alternativa: gerarIdAlternativa(idQ, tpQ),
            texto_alternativa: '',
        };
        switch(tpQ){
            case 'multipla_escolha':
                obj.correta = false;
                setAlternativasM([...alternativasM, obj]);
                break;
            case 'rankeamento':
                obj.valor_alternativa = 0;
                setAlternativasR([...alternativasR, obj]);
                break;
            case 'multipla_escolha_com_valores':
                obj.porcentagem = 0;
                setAlternativasMV([...alternativasMV, obj]);
                break;
            default:
        };
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
        switch(tpQ){
            case 'multipla_escolha':
                setAlternativasM(alternativasM.filter((alternativa) => alternativa.id_questao !== idQ || alternativa.id_alternativa !== idA));
                break;
            case 'rankeamento':
                setAlternativasR(alternativasR.filter((alternativa) => alternativa.id_questao !== idQ || alternativa.id_alternativa !== idA));
                break;
            case 'multipla_escolha_com_valores':
                setAlternativasMV(alternativasMV.filter((alternativa) => alternativa.id_questao !== idQ || alternativa.id_alternativa !== idA));
                break;
            default:
        };
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

        const { email_admin } = JSON.parse(userInfo);

        const salvando = toast.loading('Salvando Alterações...');
        baseUrlServicosGerais.post('/teste/gerir', {
            email_admin,
            data_alteracao: new Date(),
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
                };
            }
        }
        return true;
    };

    const handleChangeEnunciado = (val, idQ) => {
        const newQuestoes = [...questoes];
        newQuestoes[
            newQuestoes.findIndex((questao) => 
                questao.id_questao === idQ
            )
        ].enunciado_questao = val;
        setQuestoes(newQuestoes);
    };

    const handleChangeValor = (val, idQ) => {
        const newQuestoes = [...questoes];
        newQuestoes[
            newQuestoes.findIndex((questao) =>
                questao.id_questao === idQ
            )
        ].valor_questao = val;
        setQuestoes(newQuestoes);
    };

    const handleChangeTextoAlternativa = (val, idQ, idA, tpQ) => {
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
        ].texto_alternativa = val;
        func(newAlternativas);
    };

    const handleChangeValorAlternativa = (val, idQ, idA) => {
        const newAlternativasR = [...alternativasR];
        newAlternativasR[
            newAlternativasR.findIndex((alternativa) =>
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].valor_alternativa = val;
        setAlternativasR(newAlternativasR);
    };

    const handleChangePorcentagemAlternativa = (val, idQ, idA) => {
        const newAlternativasMV = [...alternativasMV];
        newAlternativasMV[
            newAlternativasMV.findIndex((alternativa) =>
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].porcentagem = val;
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
                                    adicionarAlternativa={adicionarAlternativa}
                                    confirmarRemoverQuestao={confirmarRemoverQuestao}
                                    confirmarRemoverAlternativa={confirmarRemoverAlternativa}
                                    handleChangeEnunciado={handleChangeEnunciado}
                                    handleChangeValor={handleChangeValor}
                                    handleChangeTextoAlternativa={handleChangeTextoAlternativa}
                                    handleChangeCorreta={handleChangeCorreta}
                                    handleChangeValorAlternativa={handleChangeValorAlternativa}
                                    handleChangePorcentagemAlternativa={handleChangePorcentagemAlternativa}/>
                                    <div className={layoutBotoesAdd() + ' mt-4'}>
                                        <button
                                        id='btn-add-qm'
                                        className='btn mb-3'
                                        onClick={() => adicionarQuestao(softSkill.id_soft_skill, 'ME')}>
                                            <i className='pi pi-plus'/> Múltipla Escolha
                                        </button>
                                        <button
                                        id='btn-add-qmv'
                                        className='btn mb-3'
                                        onClick={() => adicionarQuestao(softSkill.id_soft_skill, 'MV')}>
                                            <i className='pi pi-plus'/> Múltipla Escolha com Valores
                                        </button>
                                        <button
                                        id='btn-add-qr'
                                        className='btn mb-3'
                                        onClick={() => adicionarQuestao(softSkill.id_soft_skill, 'R')}>
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
                    tpQ={item.tipo_questao}/>
                );
            case 'multipla_escolha_com_valores':
                return (
                    <AlternativesMV
                    alternativasMV={props.alternativasMV.filter((alternativa) => alternativa.id_questao === item.id_questao)}
                    handleChangeTextoAlternativa={props.handleChangeTextoAlternativa}
                    handleChangePorcentagemAlternativa={props.handleChangePorcentagemAlternativa}
                    confirmarRemoverAlternativa={props.confirmarRemoverAlternativa}
                    tpQ={item.tipo_questao}/>
                );
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
            case 'multipla_escolha_com_valores':
                return 'w-26rem';
            case 'rankeamento':
                return 'w-19rem';
            case 'multipla_escolha':
                return 'w-20rem';
            default:
        };
    };

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
                        <div className='mt-4 mb-3'>
                            <div className='flex flex-row align-items-center mb-2'>
                                <div className='flex-1 mr-3'>
                                    <label>Enunciado:</label>
                                    <InputTextarea
                                    value={item.enunciado_questao}
                                    onChange={e => props.handleChangeEnunciado(e.target.value, item.id_questao)}/>  
                                </div>
                                <div className={layoutTipoQuestao(item.tipo_questao) + ' xl:block lg:block md:hidden sm:hidden'}>
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
                                        <InputNumber
                                        locale='pt-BR'
                                        maxFractionDigits={0}
                                        min={0}
                                        allowEmpty={false}
                                        showButtons
                                        buttonLayout='horizontal'
                                        decrementButtonIcon='pi pi-minus'
                                        incrementButtonIcon='pi pi-plus'
                                        value={item.valor_questao}
                                        onValueChange={e => props.handleChangeValor(e.value, item.id_questao)}
                                        pt={{
                                            root: {className: 'flex flex-row'},
                                            incrementButton: {className: 'btn btn-primary'},
                                            decrementButton: {className: 'btn btn-primary'},
                                        }}/>
                                    </div>
                                </div>
                            </div>
                            <div className={layoutTipoQuestao(item.tipo_questao) + ' xl:hidden lg:hidden md:block sm:block'}>
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
                                    <InputNumber
                                    locale='pt-BR'
                                    maxFractionDigits={0}
                                    min={0}
                                    allowEmpty={false}
                                    showButtons
                                    buttonLayout='horizontal'
                                    decrementButtonIcon='pi pi-minus'
                                    incrementButtonIcon='pi pi-plus'
                                    value={item.valor_questao}
                                    onValueChange={e => props.handleChangeValor(e.value, item.id_questao)}
                                    pt={{
                                        root: {className: 'flex flex-row'},
                                        incrementButton: {className: 'btn btn-primary'},
                                        decrementButton: {className: 'btn btn-primary'},
                                    }}/>
                                </div>
                            </div>
                        </div>
                        <div className='mb-4'>
                            {montarAlternativas(item)}
                        </div>
                        <div className='flex justify-content-center'>
                            <button
                            className='btn btn-primary pr-3 pl-3'
                            onClick={() => props.adicionarAlternativa(item.id_questao, item.tipo_questao)}>
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
                    className='mb-4'
                    key={item.id_alternativa}>
                        <div className='flex flex-row align-items-center mb-3'>
                            <i className='pi pi-circle-on mr-4'/>
                            <InputTextarea
                            className='xl:w-6 lg:w-6 md:w-8 sm:w-8 mr-3'
                            value={item.texto_alternativa}
                            onChange={e => props.handleChangeTextoAlternativa(e.target.value, item.id_questao, item.id_alternativa, props.tpQ)}/>
                            <div className='mr-2 xl:block lg:block md:hidden sm:hidden'>
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
                        </div>
                        <div className='xl:hidden lg:hidden md:block sm:block'>
                            <div className='flex flex-row align-items-center'>
                                <i className='pi pi-circle-on mr-4' style={{color: 'transparent'}}/>
                                <RadioButton
                                className='mr-2'
                                inputId={`rbCorreta-${item.id_questao}`}
                                checked={item.correta}
                                onChange={() => props.handleChangeCorreta(item.id_questao, item.id_alternativa)}/>
                                <label htmlFor={`rbCorreta-${item.id_questao}`}>Correta</label>
                            </div>
                        </div>
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
                    className='mb-4'
                    key={item.id_alternativa}>
                        <div className='flex flex-row align-items-center mb-2'>
                            <i className='pi pi-circle-on mr-4'/>
                            <InputTextarea
                            className='xl:w-6 lg:w-6 md:w-8 sm:w-8 mr-3'
                            value={item.texto_alternativa}
                            onChange={e => props.handleChangeTextoAlternativa(e.target.value, item.id_questao, item.id_alternativa, props.tpQ)}/>
                            <div className='flex mr-2 xl:block lg:hidden md:hidden sm:hidden'>
                                <div className='p-inputgroup max-w-23rem'>
                                    <span className='p-inputgroup-addon'>
                                        Porcentagem da Nota:
                                    </span>
                                    <InputNumber
                                    locale='pt-BR'
                                    maxFractionDigits={0}
                                    min={0}
                                    max={100}
                                    suffix='%'
                                    showButtons
                                    buttonLayout='horizontal'
                                    decrementButtonIcon='pi pi-minus'
                                    incrementButtonIcon='pi pi-plus'
                                    allowEmpty={false}
                                    value={item.porcentagem}
                                    onValueChange={e => props.handleChangePorcentagemAlternativa(e.value, item.id_questao, item.id_alternativa)}
                                    pt={{
                                        root: {className: 'flex flex-row'},
                                        incrementButton: {className: 'btn btn-primary'},
                                        decrementButton: {className: 'btn btn-primary'},
                                    }}/>
                                </div>
                            </div>
                            <button
                            className='btn btn-danger'
                            onClick={e => props.confirmarRemoverAlternativa(e, item.id_questao, item.id_alternativa, props.tpQ)}>
                                X
                            </button>
                        </div>
                        <div className='xl:hidden lg:block md:block sm:block'>
                            <div className='flex flex-row align-items-center'>
                               <i className='pi pi-circle-on mr-4' style={{color: 'transparent'}}/>
                                <div className='flex flex-row align-items-center'>
                                    <div className='p-inputgroup max-w-23rem'>
                                        <span className='p-inputgroup-addon'>
                                            Porcentagem da Nota:
                                        </span>
                                        <InputNumber
                                        locale='pt-BR'
                                        maxFractionDigits={0}
                                        min={0}
                                        max={100}
                                        suffix='%'
                                        showButtons
                                        buttonLayout='horizontal'
                                        decrementButtonIcon='pi pi-minus'
                                        incrementButtonIcon='pi pi-plus'
                                        allowEmpty={false}
                                        value={item.porcentagem}
                                        onValueChange={e => props.handleChangePorcentagemAlternativa(e.value, item.id_questao, item.id_alternativa)}
                                        pt={{
                                            root: {className: 'flex flex-row'},
                                            incrementButton: {className: 'btn btn-primary'},
                                            decrementButton: {className: 'btn btn-primary'},
                                        }}/>
                                    </div>
                                </div> 
                            </div>
                        </div>
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
                    className=' mb-4'
                    style={style}
                    key={item.id_alternativa}>
                        <div className='flex flex-row align-items-center mb-2'>
                            <i className='pi pi-circle-on mr-4'/>
                            <InputTextarea
                            className='xl:w-6 lg:w-6 md:w-8 sm:w-8 mr-3'
                            value={item.texto_alternativa}
                            onChange={e => props.handleChangeTextoAlternativa(e.target.value, item.id_questao, item.id_alternativa, props.tpQ)}/>
                            <div className='flex mr-2 xl:block lg:hidden md:hidden sm:hidden'>
                                <div className='p-inputgroup max-w-21rem'>
                                    <span className='p-inputgroup-addon'>
                                        Valor da Alternativa:
                                    </span>
                                    <InputNumber
                                    locale='pt-BR'
                                    maxFractionDigits={0}
                                    min={0}
                                    allowEmpty={false}
                                    showButtons
                                    buttonLayout='horizontal'
                                    decrementButtonIcon='pi pi-minus'
                                    incrementButtonIcon='pi pi-plus'
                                    value={item.valor_alternativa}
                                    onValueChange={e => props.handleChangeValorAlternativa(e.value, item.id_questao, item.id_alternativa)}
                                    pt={{
                                        root: {className: 'flex flex-row'},
                                        incrementButton: {className: 'btn btn-primary'},
                                        decrementButton: {className: 'btn btn-primary'},
                                    }}/>
                                </div>
                            </div>
                            <button
                            className='btn btn-danger'
                            onClick={e => props.confirmarRemoverAlternativa(e, item.id_questao, item.id_alternativa, props.tpQ)}>
                                X
                            </button>
                        </div>
                        <div className='xl:hidden lg:block md:block sm:block'>
                            <div className='flex flex-row align-items-center'>
                                <i className='pi pi-circle-on mr-4' style={{color: 'transparent'}}/>
                                <div className='p-inputgroup max-w-21rem'>
                                    <span className='p-inputgroup-addon'>
                                        Valor da Alternativa:
                                    </span>
                                    <InputNumber
                                    locale='pt-BR'
                                    maxFractionDigits={0}
                                    min={0}
                                    allowEmpty={false}
                                    showButtons
                                    buttonLayout='horizontal'
                                    decrementButtonIcon='pi pi-minus'
                                    incrementButtonIcon='pi pi-plus'
                                    value={item.valor_alternativa}
                                    onValueChange={e => props.handleChangeValorAlternativa(e.value, item.id_questao, item.id_alternativa)}
                                    pt={{
                                        root: {className: 'flex flex-row'},
                                        incrementButton: {className: 'btn btn-primary'},
                                        decrementButton: {className: 'btn btn-primary'},
                                    }}/>
                                </div>
                            </div>
                        </div>
                    </animated.div>
                )
            }
        </div>
    );
};

export default ManageTest;