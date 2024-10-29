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
import { animated, useTransition } from 'react-spring';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import Dropdown from 'react-bootstrap/Dropdown';
import { Accordion, AccordionTab } from 'primereact/accordion';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';
import '../../styles/ManageTest.css';

const generalServicesURL = 'http://localhost:6004';

const connectionGeneralServices = axios.create({
    baseURL: generalServicesURL
});

const springAnimationsConfig = {
    from: { opacity: 0, transform: 'scale(0)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0)' },
    config: { duration: 500 },
}

const ManageTest = () => {
    const [questions, setQuestions] = useState([]);
    const [alternativesMC, setAlternativesMC] = useState([]);
    const [alternativesMCV, setAlternativesMCV] = useState([]);
    const [alternativesR, setAlternativesR] = useState([]);
    const [softSkills, setSoftSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(true);
    const [countBegin, setCountBegin] = useState(0);
    const [error, setError] = useState('');

    const token = sessionStorage.getItem('token');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    const userInfo = sessionStorage.getItem('userInfo');

    const mountPage = () => {
        const fetchSoftSkills = async () => {
            try{
                const response = (await connectionGeneralServices.get('/softskills/listar',
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
                else if(error.request) msg = 'Error while trying to access the server!'
                return Promise.reject(msg);
            }
        };

        const fetchTeste = async (SSs) => {
            try{
                const response = (await connectionGeneralServices.get('/teste/fetch',
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
                else if(error.request) msg = 'Error while trying to access the server!'
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
            setSoftSkills(() => SSs);
            setQuestions(() => questoes);
            setAlternativesMC(() => alternativasMultiplaEscolha);
            setAlternativesR(() => alternativasRankeamento);
            setAlternativesMCV(() => alternativasMultiplaEscolhaComValores);
        })
        .catch((error) =>
            setError(() => error)
        )
        .finally(() => setLoading(false));
    };

    //Iniciating the page
    useEffect(() => {
        if(!token || !tipoUsuario || !userInfo){
            toast.error(`Unauthenticated user! You won't be able to actualize your operations while you are not properly logged in!`);
        }

        mountPage();
    }, []);

    useEffect(() => {
        if(saved && (countBegin > 1)) setSaved(() => false);
        if(countBegin <= 1) setCountBegin(oldValue => oldValue + 1);
    }, [questions, alternativesMC, alternativesR, alternativesMCV]); // eslint-disable-line

    useEffect(() => {
        if(!saved){
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
    }, [saved]);

    const gerarIdQuestao = () => {
        if(questions.length === 0) return 1;
        else{
            let max = 0;
            for(let i = 0; i < questions.length; i++){
                if(questions[i].id_questao > max){
                    max = questions[i].id_questao;
                }
            }
            return max + 1;
        }
    };

    const adicionarQuestao = (idSS, tpQ) => {
        const newQuestoes = [...questions];
        let obj = {
            id_questao: gerarIdQuestao(),
            id_soft_skill: idSS,
            enunciado_questao: '',
            valor_questao: 0,
            tipo_questao: '',
        };
        switch(tpQ){
            case 'M':
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
        setQuestions(newQuestoes);
    }

    const confirmarRemoverQuestao = (e, idQ, tpQ) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to remove this question?',
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => removerQuestao(idQ, tpQ),
        });
    };

    const removerQuestao = (idQ, tpQ) => {
        const newQuestoes = questions.filter((questao) => questao.id_questao !== idQ);
        setQuestions(newQuestoes);

        switch(tpQ){
            case 'multipla_escolha':
                setAlternativesMC(alternativesMC.filter((alternativa) => alternativa.id_questao !== idQ));
                break;
            case 'rankeamento':
                setAlternativesR(alternativesR.filter((alternativa) => alternativa.id_questao !== idQ));
                break;
            case 'multipla_escolha_com_valores':
                setAlternativesMCV(alternativesMCV.filter((alternativa) => alternativa.id_questao !== idQ));
                break;
            default:
        };
    };

    const gerarIdAlternativa = (idQ, tpQ) => {
        let alternativas;
        switch(tpQ){
            case 'multipla_escolha':
                alternativas = alternativesMC.filter((alternativa) => alternativa.id_questao === idQ);
                break;
            case 'rankeamento':
                alternativas = alternativesR.filter((alternativa) => alternativa.id_questao === idQ);
                break;
            case 'multipla_escolha_com_valores':
                alternativas = alternativesMCV.filter((alternativa) => alternativa.id_questao === idQ);
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
                setAlternativesMC([...alternativesMC, obj]);
                break;
            case 'rankeamento':
                obj.valor_alternativa = 0;
                setAlternativesR([...alternativesR, obj]);
                break;
            case 'multipla_escolha_com_valores':
                obj.porcentagem = 0;
                setAlternativesMCV([...alternativesMCV, obj]);
                break;
            default:
        };
    };

    const confirmarRemoverAlternativa = (e, idQ, idA, tpQ) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to remove this alternative?',
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => removerAlternativa(idQ, idA, tpQ),
        });
    };

    const removerAlternativa = (idQ, idA, tpQ) => {
        switch(tpQ){
            case 'multipla_escolha':
                setAlternativesMC(alternativesMC.filter((alternativa) => alternativa.id_questao !== idQ || alternativa.id_alternativa !== idA));
                break;
            case 'rankeamento':
                setAlternativesR(alternativesR.filter((alternativa) => alternativa.id_questao !== idQ || alternativa.id_alternativa !== idA));
                break;
            case 'multipla_escolha_com_valores':
                setAlternativesMCV(alternativesMCV.filter((alternativa) => alternativa.id_questao !== idQ || alternativa.id_alternativa !== idA));
                break;
            default:
        };
    };

    const confirmarSalvarAlteracoes = (e) => {
        confirmDialog({
            target: e.currentTarget,
            message: 'Do you really want to save the changes?',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: salvarAlteracoes,
        });
    };

    const salvarAlteracoes = async () => {
        if(!realizarVerificacoes()) return;

        const { email_admin } = JSON.parse(userInfo);

        const salvando = toast.loading('Saving changes...');
        connectionGeneralServices.post('/teste/gerir', {
            email_admin,
            data_alteracao: new Date(),
            questoes: questions,
            alternativasMultiplaEscolha: alternativesMC,
            alternativasRankeamento: alternativesR,
            alternativasMultiplaEscolhaComValores: alternativesMCV
        },
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { tipoUsuario }
        })
        .then(() => {
            toast.update(salvando, {
                render: 'Changes saved successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });
            setSaved(true);
        })
        .catch((error) => {
            let msg
            if(error.response) msg = error.response.data.message
            else if(error.request) msg = 'Error while trying to access the server!'
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
            const questsSS = questions.filter((questao) => questao.id_soft_skill === softSkills[i].id_soft_skill);
            for(let j = 0; j < questsSS.length; j++){
                if(questsSS[j].enunciado_questao === ''){
                toast.error(`Soft Skill ${softSkills[i].nome_soft_skill}'s ${j + 1} question has no statement!`, {
                    autoClose: 5000
                });
                    return false;
                }
                if(questsSS[j].valor_questao === 0){
                    toast.error(`Soft Skill ${softSkills[i].nome_soft_skill}'s ${j + 1} question has no value!`, {
                        autoClose: 5000
                    });
                    return false;
                }
                let alts;
                switch(questsSS[j].tipo_questao){
                    case 'multipla_escolha':
                        alts = alternativesMC.filter((alternativa) => alternativa.id_questao === questsSS[j].id_questao);
                        break;
                    case 'rankeamento':
                        alts = alternativesR.filter((alternativa) => alternativa.id_questao === questsSS[j].id_questao);
                        break;
                    case 'multipla_escolha_com_valores':
                        alts = alternativesMCV.filter((alternativa) => alternativa.id_questao === questsSS[j].id_questao);
                        break;
                    default:
                };
                if(alts.length < 2){
                    toast.error(`Soft Skill ${softSkills[i].nome_soft_skill}'s ${j + 1} question needs to have at least 2 alternatives!`, {
                        autoClose: 5000
                    });
                    return false;
                }
                for(let k = 0; k < alts.length; k++){
                    if(alts[k].texto_alternativa === ''){
                        toast.error(`The ${k + 1} alternative of Soft Skill ${softSkills[i].nome_soft_skill}'s ${j + 1} question has no text!`, {
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
                                toast.error(`Soft Skill ${softSkills[i].nome_soft_skill}'s ${j + 1} question has no right answer!`, {
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
        const newQuestoes = [...questions];
        newQuestoes[
            newQuestoes.findIndex((questao) => 
                questao.id_questao === idQ
            )
        ].enunciado_questao = val;
        setQuestions(newQuestoes);
    };

    const handleChangeValor = (val, idQ) => {
        const newQuestoes = [...questions];
        newQuestoes[
            newQuestoes.findIndex((questao) =>
                questao.id_questao === idQ
            )
        ].valor_questao = val;
        setQuestions(newQuestoes);
    };

    const handleChangeTextoAlternativa = (val, idQ, idA, tpQ) => {
        let newAlternativas, func;
        switch(tpQ){
            case 'multipla_escolha':
                newAlternativas = [...alternativesMC];
                func = setAlternativesMC;
                break;
            case 'rankeamento':
                newAlternativas = [...alternativesR];
                func = setAlternativesR;
                break;
            case 'multipla_escolha_com_valores':
                newAlternativas = [...alternativesMCV];
                func = setAlternativesMCV;
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
        const newAlternativasR = [...alternativesR];
        newAlternativasR[
            newAlternativasR.findIndex((alternativa) =>
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].valor_alternativa = val;
        setAlternativesR(newAlternativasR);
    };

    const handleChangePorcentagemAlternativa = (val, idQ, idA) => {
        const newAlternativasMV = [...alternativesMCV];
        newAlternativasMV[
            newAlternativasMV.findIndex((alternativa) =>
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].porcentagem = val;
        setAlternativesMCV(newAlternativasMV);
    };

    const handleChangeCorreta = (idQ, idA) => {
        const newAlternativasM = [...alternativesMC];
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
        setAlternativesMC(newAlternativasM);
    };

    return (
        <div>
            <Navbar/>
            <div className='m-test-box'>
                <h1>Proficiency Test Management</h1>
                <Divider/>
                <div className='flex justify-content-center'>
                        {
                            (error !== '') &&
                            <ErrorMessage msg={error}/>
                        }
                        {
                            loading &&
                            <Loading msg='Loading Test...'/>
                        }
                    </div>
                <div>
                    <Accordion multiple>
                        {
                            softSkills.map((softSkill) => {
                                return (
                                    <AccordionTab
                                    key={softSkill.id_soft_skill}
                                    header={softSkill.nome_soft_skill}
                                    pt={{
                                        headerAction: {className: 'accordion-h'},
                                        headerTitle: {style: {
                                            textTransform: 'uppercase',
                                            fontSize: '1.5rem',
                                        }}
                                    }}>
                                        <Quests
                                        questoes={questions.filter((questao) => questao.id_soft_skill === softSkill.id_soft_skill)}
                                        alternativasM={alternativesMC}
                                        alternativasR={alternativesR}
                                        alternativasMV={alternativesMCV}
                                        adicionarAlternativa={adicionarAlternativa}
                                        confirmarRemoverQuestao={confirmarRemoverQuestao}
                                        confirmarRemoverAlternativa={confirmarRemoverAlternativa}
                                        handleChangeEnunciado={handleChangeEnunciado}
                                        handleChangeValor={handleChangeValor}
                                        handleChangeTextoAlternativa={handleChangeTextoAlternativa}
                                        handleChangeCorreta={handleChangeCorreta}
                                        handleChangeValorAlternativa={handleChangeValorAlternativa}
                                        handleChangePorcentagemAlternativa={handleChangePorcentagemAlternativa}/>
                                        <div className='flex flex-row justify-content-center'>
                                            <div>
                                                <Dropdown>
                                                <Dropdown.Toggle as='button' className='add-quest-btn shadow-box-btns'>
                                                    <i className='pi pi-plus mr-2'/> Add Question
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu style={{backgroundColor: '#28213f', border: '2px solid white'}}>
                                                    <Dropdown.Item className='dropdown-buttons' as='button' onClick={() => adicionarQuestao(softSkill.id_soft_skill, 'M')}>
                                                        <i className='pi pi-plus mr-2'/> Multiple Choices
                                                    </Dropdown.Item>
                                                    <Dropdown.Item className='dropdown-buttons' as='button' onClick={() => adicionarQuestao(softSkill.id_soft_skill, 'R')}>
                                                        <i className='pi pi-plus mr-2'/> Ranking
                                                    </Dropdown.Item>
                                                    <Dropdown.Item className='dropdown-buttons' as='button' onClick={() => adicionarQuestao(softSkill.id_soft_skill, 'MV')}>
                                                        <i className='pi pi-plus mr-2'/> Multiple Choices with Values
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            </div>
                                        </div>
                                    </AccordionTab>
                                );
                            })
                        }
                    </Accordion>
                    {
                        questions.length > 0 &&
                        <div>
                            <Divider/>
                            <div className='flex justify-content-center mt-4'>
                                <button
                                className='btn btn-success shadow-box-btns'
                                onClick={e => confirmarSalvarAlteracoes(e)}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </div>

            {/* Messages and confirmation parts */}

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
    const transicao = useTransition(props.questoes, springAnimationsConfig);

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
                return 'Multiple Choices';
            case 'rankeamento':
                return 'Ranking';
            case 'multipla_escolha_com_valores':
                return 'Multiple Choices with Values';
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

    const conjuntoTipoValor = (item) => {
        return (
            <div>
               <div className='p-inputgroup mb-2'>
                    <span className='p-inputgroup-addon'>
                        Question Type:
                    </span>
                    <InputText
                    className='text-center'
                    style={{fontWeight: 'bold'}}
                    value={valorTipoQuestao(item.tipo_questao)}
                    disabled/>
                </div>
                <div className='p-inputgroup'>
                    <span className='p-inputgroup-addon'>
                        Question Value:
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
        )
    };

    return (
        <div>
            {
                transicao((style, item) =>
                    item &&
                    <animated.div
                    style={style}
                    className='m-quest-box'
                    key={item.id_questao}>
                        <div className='flex justify-content-between'>
                            <h3>Question {props.questoes.findIndex(questao => questao.id_questao === item.id_questao) + 1}</h3>
                            <button
                            className='btn btn-danger'
                            onClick={e => props.confirmarRemoverQuestao(e, item.id_questao, item.tipo_questao)}>
                                X
                            </button>
                        </div>
                        <div className='mt-4 mb-3'>
                            <div className='flex flex-row align-items-center mb-2'>
                                <div className='flex-1 mr-3'>
                                    <label style={{fontSize: '1.3rem'}}><b>Statement</b></label>
                                    <InputTextarea
                                    value={item.enunciado_questao}
                                    onChange={e => props.handleChangeEnunciado(e.target.value, item.id_questao)}/>  
                                </div>
                                <div className={layoutTipoQuestao(item.tipo_questao) + ' xl:block lg:block md:hidden sm:hidden'}>
                                    {conjuntoTipoValor(item)}
                                </div>
                            </div>
                            <div className={layoutTipoQuestao(item.tipo_questao) + ' xl:hidden lg:hidden md:block sm:block'}>
                                {conjuntoTipoValor(item)}
                            </div>
                        </div>
                        <div className='mb-4'>
                            {montarAlternativas(item)}
                        </div>
                        <div className='flex justify-content-center'>
                            <button
                            id='add-alt-btn'
                            className='btn btn-primary pr-3 pl-3 shadow-box-btns'
                            onClick={() => props.adicionarAlternativa(item.id_questao, item.tipo_questao)}>
                                <i className='pi pi-plus'/> Add Alternative
                            </button>
                        </div>
                    </animated.div>
                )
            }
        </div>
    );
};

const AlternativesME = (props) => {
    const transicao = useTransition(props.alternativasM, springAnimationsConfig);

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
                            <div className='mr-2 xl:block lg:block md:hidden sm:hidden mr-1'>
                                <RadioButton
                                className='mr-2'
                                inputId={`rbCorreta-${item.id_questao}`}
                                checked={item.correta}
                                onChange={() => props.handleChangeCorreta(item.id_questao, item.id_alternativa)}/>
                                <label htmlFor={`rbCorreta-${item.id_questao}`}>Correct</label>
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
                                <label htmlFor={`rbCorreta-${item.id_questao}`}>Correct</label>
                            </div>
                        </div>
                    </animated.div>
                )
            }
        </div>
    );
};

const AlternativesMV = (props) => {
    const transicao = useTransition(props.alternativasMV, springAnimationsConfig);

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
                                        Score Percentage:
                                    </span>
                                    <InputNumber
                                    locale='en-US'
                                    maxFractionDigits={0}
                                    step={5}
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
                                            Score Percentage:
                                        </span>
                                        <InputNumber
                                        locale='en-US'
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
    const transicao = useTransition(props.alternativasR, springAnimationsConfig);

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
                                       Alternative Value:
                                    </span>
                                    <InputNumber
                                    locale='en-US'
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
                                        Alternative Value:
                                    </span>
                                    <InputNumber
                                    locale='en-US'
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