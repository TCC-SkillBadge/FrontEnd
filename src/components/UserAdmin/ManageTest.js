import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import Dropdown from 'react-bootstrap/Dropdown';
import { Accordion, AccordionTab } from 'primereact/accordion';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';
import { protectRoute } from '../../utils/general-functions/ProtectRoutes';
import { jwtExpirationHandler } from '../../utils/general-functions/JWTExpirationHandler';
import '../../styles/ManageTest.css';
import '../../styles/GlobalStylings.css';
import '../../styles/JWTExpirationModal.css';

const springAnimationsConfig = {
    from: { opacity: 0, transform: 'scale(0)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0)' },
    config: { duration: 500 },
}

const ManageTest = () => {
    const [token, _setToken] = useState(sessionStorage.getItem('token'));
    const [userType, _setUserType] = useState(sessionStorage.getItem('tipoUsuario'));
    const [userInfo, _setUserInfo] = useState(JSON.parse(sessionStorage.getItem('userInfo')));
    const [userEmail, _setUserEmail] = useState(userInfo.email_admin);

    const [questions, setQuestions] = useState([]);
    const [alternativesM, setAlternativesM] = useState([]);
    const [alternativesMV, setAlternativesMV] = useState([]);
    const [alternativesR, setAlternativesR] = useState([]);
    const [softSkills, setSoftSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [finishedInitialLoading, setFinishedInitialLoading] = useState(false);
    const [saved, setSaved] = useState(true);
    const [savedQuestions, setSavedQuestions] = useState('');
    const [savedAlternativesM, setSavedAlternativesM] = useState('');
    const [savedAlternativesR, setSavedAlternativesR] = useState('');
    const [savedAlternativesMV, setSavedAlternativesMV] = useState('');

    //Definindo conexão com o backend
    const generalServicesURL = 'https://ms-softskill.azurewebsites.net';

    //URL Local: http://localhost:6004
    //URL Azure: https://ms-softskill.azurewebsites.net
    //URL Heroku: https://test-softskills-bb1e48ce063a.herokuapp.com

    const connectionGeneralServices = axios.create({
        baseURL: generalServicesURL,
        headers: { Authorization: `Bearer ${token}` }
    });
    //-----------------------------------------------------------------------------------

    //Iniciating the page
    useEffect(() => {
        mountPage();
    }, []);

    useEffect(() => {
        const questsAux = JSON.stringify(questions);
        const altsMAux = JSON.stringify(alternativesM);
        const altsRAux = JSON.stringify(alternativesR);
        const altsMVAux = JSON.stringify(alternativesMV);

        if(
            (
                questsAux !== savedQuestions ||
                altsMAux !== savedAlternativesM ||
                altsRAux !== savedAlternativesR ||
                altsMVAux !== savedAlternativesMV
            ) && finishedInitialLoading
        ) setSaved(() => false);
        else setSaved(() => true);
    }, [questions, alternativesM, alternativesR, alternativesMV]); // eslint-disable-line

    useEffect(() => {
        window.onbeforeunload = (e) => {
            if(saved) return;

            e.preventDefault();
            e.returnValue = '';
        };

        return () => { 
            window.onbeforeunload = null;
        };
    }, [saved]);

    const mountPage = () => {
        const fetchSoftSkills = async () => {
            try{
                const response = (await connectionGeneralServices.get('/softskills/listar')).data;
                return Promise.resolve(response);
            }
            catch(error){
                const msg = handleRequestError(error);
                return Promise.reject(msg);
            }
        };

        const fetchTeste = async (SSs) => {
            try{
                const response = (await connectionGeneralServices.get('/teste/fetch')).data;
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
                const msg = handleRequestError(error);
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
            setAlternativesM(() => alternativasMultiplaEscolha);
            setAlternativesR(() => alternativasRankeamento);
            setAlternativesMV(() => alternativasMultiplaEscolhaComValores);

            setSavedState(questoes, alternativasMultiplaEscolha, alternativasRankeamento, alternativasMultiplaEscolhaComValores);
            setFinishedInitialLoading(() => true);
        })
        .catch((error) =>
            setError(() => error)
        )
        .finally(() => setLoading(() => false));
    };

    const setSavedState = (quests, altsM, altsR, altsMV) => {
        setSavedQuestions(() => JSON.stringify(quests));
        setSavedAlternativesM(() => JSON.stringify(altsM));
        setSavedAlternativesR(() => JSON.stringify(altsR));
        setSavedAlternativesMV(() => JSON.stringify(altsMV));
        setSaved(() => true);
    };

    const generateQuestionId = () => {
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

    const addQuestion = (idSS, tpQ) => {
        const newQuestions = [...questions];
        let obj = {
            id_questao: generateQuestionId(),
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
        newQuestions.push(obj);
        setQuestions(() => newQuestions);
    }

    const confirmRemoveQuestion = (e, idQ, tpQ) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to remove this question?',
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptClassName: 'dbuttons dbuttons-success',
            rejectClassName: 'dbuttons dbuttons-danger',
            accept: () => removeQuestion(idQ, tpQ),
        });
    };

    const removeQuestion = (idQ, tpQ) => {
        const newQuestions = questions.filter((questao) => questao.id_questao !== idQ);
        setQuestions(() => newQuestions);

        switch(tpQ){
            case 'multipla_escolha':
                setAlternativesM((currentAlternatives) => currentAlternatives.filter((alt) => alt.id_questao !== idQ));
                break;
            case 'rankeamento':
                setAlternativesR((currentAlternatives) => currentAlternatives.filter((alt) => alt.id_questao !== idQ));
                break;
            case 'multipla_escolha_com_valores':
                setAlternativesMV((currentAlternatives) => currentAlternatives.filter((alt) => alt.id_questao !== idQ));
                break;
            default:
        };
    };

    const generateAlternativeId = (idQ, tpQ) => {
        let alternativeOptions;
        switch(tpQ){
            case 'multipla_escolha':
                alternativeOptions = alternativesM.filter((alternativa) => alternativa.id_questao === idQ);
                break;
            case 'rankeamento':
                alternativeOptions = alternativesR.filter((alternativa) => alternativa.id_questao === idQ);
                break;
            case 'multipla_escolha_com_valores':
                alternativeOptions = alternativesMV.filter((alternativa) => alternativa.id_questao === idQ);
                break;
            default:
        };
        if(alternativeOptions.length === 0) return 1;
        else{
            let max = 0;
            for(let i = 0; i < alternativeOptions.length; i++){
                if(alternativeOptions[i].id_alternativa > max){
                    max = alternativeOptions[i].id_alternativa;
                }
            }
            return max + 1;
        }
    };

    const addAlternative = (idQ, tpQ) => {
        let obj = {
            id_questao: idQ,
            id_alternativa: generateAlternativeId(idQ, tpQ),
            texto_alternativa: '',
        };
        switch(tpQ){
            case 'multipla_escolha':
                obj.correta = false;
                setAlternativesM((oldAlternatives) => [...oldAlternatives, obj]);
                break;
            case 'rankeamento':
                obj.valor_alternativa = 0;
                setAlternativesR((oldAlternatives) => [...oldAlternatives, obj]);
                break;
            case 'multipla_escolha_com_valores':
                obj.porcentagem = 0;
                setAlternativesMV((oldAlternatives) => [...oldAlternatives, obj]);
                break;
            default:
        };
    };

    const confirmRemoveAlternative = (e, idQ, idA, tpQ) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to remove this alternative?',
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptClassName: 'dbuttons dbuttons-success',
            rejectClassName: 'dbuttons dbuttons-danger',
            accept: () => removeAlternative(idQ, idA, tpQ),
        });
    };

    const removeAlternative = (idQ, idA, tpQ) => {
        switch(tpQ){
            case 'multipla_escolha':
                setAlternativesM((currentAlternatives) => currentAlternatives.filter((alt) => alt.id_questao !== idQ || alt.id_alternativa !== idA));
                break;
            case 'rankeamento':
                setAlternativesR((currentAlternatives) => currentAlternatives.filter((alt) => alt.id_questao !== idQ || alt.id_alternativa !== idA));
                break;
            case 'multipla_escolha_com_valores':
                setAlternativesMV((currentAlternatives) => currentAlternatives.filter((alt) => alt.id_questao !== idQ || alt.id_alternativa !== idA));
                break;
            default:
        };
    };

    const confirmSaveChanges = (e) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to save the changes made?',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptClassName: 'dbuttons dbuttons-success',
            rejectClassName: 'dbuttons dbuttons-danger',
            accept: () => saveChanges(),
        })
    };

    const saveChanges = async () => {
        if(!doVerifications()) return;

        const saving = toast.loading('Saving changes...');
        connectionGeneralServices.post('/teste/gerir', {
            email_admin: userEmail,
            data_alteracao: new Date(),
            questoes: questions,
            alternativasMultiplaEscolha: alternativesM,
            alternativasRankeamento: alternativesR,
            alternativasMultiplaEscolhaComValores: alternativesMV
        })
        .then(() => {
            toast.update(saving, {
                render: 'Changes saved successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });
            setSavedState(questions, alternativesM, alternativesR, alternativesMV);
        })
        .catch((error) => {
            const msg = handleRequestError(error);
            toast.update(saving, {
                render: `${msg}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        });
    };

    const doVerifications = () => {
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
                        alts = alternativesM.filter((alternativa) => alternativa.id_questao === questsSS[j].id_questao);
                        break;
                    case 'rankeamento':
                        alts = alternativesR.filter((alternativa) => alternativa.id_questao === questsSS[j].id_questao);
                        break;
                    case 'multipla_escolha_com_valores':
                        alts = alternativesMV.filter((alternativa) => alternativa.id_questao === questsSS[j].id_questao);
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

    const handleStatementChange = (val, idQ) => {
        const newQuestions = [...questions];
        newQuestions[
            newQuestions.findIndex((questao) => 
                questao.id_questao === idQ
            )
        ].enunciado_questao = val;
        setQuestions(() => newQuestions);
    };

    const handleQuestionValueChange = (val, idQ) => {
        const newQuestions = [...questions];
        newQuestions[
            newQuestions.findIndex((questao) =>
                questao.id_questao === idQ
            )
        ].valor_questao = val;
        setQuestions(() => newQuestions);
    };

    const handleChangeTextoAlternativa = (val, idQ, idA, tpQ) => {
        let newAlternatives, func;
        switch(tpQ){
            case 'multipla_escolha':
                newAlternatives = [...alternativesM];
                func = setAlternativesM;
                break;
            case 'rankeamento':
                newAlternatives = [...alternativesR];
                func = setAlternativesR;
                break;
            case 'multipla_escolha_com_valores':
                newAlternatives = [...alternativesMV];
                func = setAlternativesMV;
                break;
            default:
        };
        newAlternatives[
            newAlternatives.findIndex((alternativa) => 
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].texto_alternativa = val;
        func(() => newAlternatives);
    };

    const handleAlternativeValueChange = (val, idQ, idA) => {
        const newAlternativesR = [...alternativesR];
        newAlternativesR[
            newAlternativesR.findIndex((alternativa) =>
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].valor_alternativa = val;
        setAlternativesR(() => newAlternativesR);
    };

    const handleAlternativePercentageChange = (val, idQ, idA) => {
        const newAlternativesMV = [...alternativesMV];
        newAlternativesMV[
            newAlternativesMV.findIndex((alternativa) =>
                alternativa.id_questao === idQ && alternativa.id_alternativa === idA
            )
        ].porcentagem = val;
        setAlternativesMV(() => newAlternativesMV);
    };

    const handleCorrectAlternativeChange = (idQ, idA) => {
        const newAlternativesM = [...alternativesM];
        for(let i = 0; i < newAlternativesM.length; i++){
            if((newAlternativesM[i].id_questao === idQ) && (newAlternativesM[i].correta)){
                newAlternativesM[i].correta = false;
            }
        }
        const alt = newAlternativesM[
                        newAlternativesM.findIndex((alternativa) =>
                            alternativa.id_questao === idQ && alternativa.id_alternativa === idA
                        )
                    ];
        alt.correta = true;
        setAlternativesM(() => newAlternativesM);
    };

    const handleRequestError = (error) => {
        let msg = '';
        if(error.response){
            msg = error.response.data.message
            if(error.response.data.type === 'TokenExpired'){
                onbeforeunload = null;
                jwtExpirationHandler();
            }
        }
        else if(error.request) msg = 'Error while trying to access server!'
        return msg;
    };

    const showSaveButton = useTransition(!saved, springAnimationsConfig);

    return (
        <div>
            <div className='m-test-box default-border-image'>
                <h1>Proficiency Test Management</h1>
                <Divider/>
                <div className='flex justify-content-center'>
                        <ErrorMessage msg={error}/>
                        <Loading show={loading} msg='Loading Test...'/>
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
                                        }},
                                        content: {className: 'accordion-c'}
                                    }}>
                                        <Quests
                                        questoes={questions.filter((questao) => questao.id_soft_skill === softSkill.id_soft_skill)}
                                        alternativesM={alternativesM}
                                        alternativesR={alternativesR}
                                        alternativesMV={alternativesMV}
                                        addAlternative={addAlternative}
                                        confirmRemoveQuestion={confirmRemoveQuestion}
                                        confirmRemoveAlternative={confirmRemoveAlternative}
                                        handleStatementChange={handleStatementChange}
                                        handleQuestionValueChange={handleQuestionValueChange}
                                        handleChangeTextoAlternativa={handleChangeTextoAlternativa}
                                        handleCorrectAlternativeChange={handleCorrectAlternativeChange}
                                        handleAlternativeValueChange={handleAlternativeValueChange}
                                        handleAlternativePercentageChange={handleAlternativePercentageChange}/>
                                        <div className='flex flex-row justify-content-center'>
                                            <div>
                                                <Dropdown>
                                                    <Dropdown.Toggle
                                                    id={`add-quest-btn-[${softSkill.nome_soft_skill}]`}
                                                    as='button'
                                                    className='dbuttons dbuttons-secondary'
                                                    style={{
                                                        padding: '12px',
                                                        fontSize: 'larger',
                                                    }}>
                                                        <i className='pi pi-plus mr-2'/> Add Question
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu style={{backgroundColor: '#28213f', border: '2px solid white'}}>
                                                        <Dropdown.Item
                                                        id={`add-quest-btn-M-[${softSkill.nome_soft_skill}]`}
                                                        className='dropdown-buttons'
                                                        as='button'
                                                        onClick={() => addQuestion(softSkill.id_soft_skill, 'M')}>
                                                            <i className='pi pi-plus mr-2'/> Multiple Choices
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                        id={`add-quest-btn-R-[${softSkill.nome_soft_skill}]`}
                                                        className='dropdown-buttons'
                                                        as='button'
                                                        onClick={() => addQuestion(softSkill.id_soft_skill, 'R')}>
                                                            <i className='pi pi-plus mr-2'/> Ranking
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                        id={`add-quest-btn-MV-[${softSkill.nome_soft_skill}]`}
                                                        className='dropdown-buttons'
                                                        as='button'
                                                        onClick={() => addQuestion(softSkill.id_soft_skill, 'MV')}>
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
                        showSaveButton((style, item) => 
                            item &&
                            <animated.div style={style}>
                                <div className='flex justify-content-center mt-4 mb-3'>
                                    <button
                                    id='save-changes-btn'
                                    className='dbuttons dbuttons-primary'
                                    onClick={e => confirmSaveChanges(e)}
                                    style={{
                                        width: '25%',
                                        minWidth: '350px',
                                        fontSize: 'calc(0.8rem + 0.8vw)',
                                        fontWeight: 'bold'
                                    }}>
                                        Save Changes
                                    </button>
                                </div>
                            </animated.div>
                        )
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

            <ConfirmDialog/>
        </div>
    );
};

const Quests = (props) => {
    const transition = useTransition(props.questoes, springAnimationsConfig);

    const buildAlternatives = (item) => {
        switch(item.tipo_questao){
            case 'multipla_escolha':
                return (
                    <AlternativesM
                    alternativesM={props.alternativesM.filter((alternativa) => alternativa.id_questao === item.id_questao)}
                    handleChangeTextoAlternativa={props.handleChangeTextoAlternativa}
                    handleCorrectAlternativeChange={props.handleCorrectAlternativeChange}
                    confirmRemoveAlternative={props.confirmRemoveAlternative}
                    tpQ={item.tipo_questao}/>
                );
            case 'rankeamento':
                return (
                    <AlternativesR
                    alternativesR={props.alternativesR.filter((alternativa) => alternativa.id_questao === item.id_questao)}
                    handleChangeTextoAlternativa={props.handleChangeTextoAlternativa}
                    handleAlternativeValueChange={props.handleAlternativeValueChange}
                    confirmRemoveAlternative={props.confirmRemoveAlternative}
                    tpQ={item.tipo_questao}/>
                );
            case 'multipla_escolha_com_valores':
                return (
                    <AlternativesMV
                    alternativesMV={props.alternativesMV.filter((alternativa) => alternativa.id_questao === item.id_questao)}
                    handleChangeTextoAlternativa={props.handleChangeTextoAlternativa}
                    handleAlternativePercentageChange={props.handleAlternativePercentageChange}
                    confirmRemoveAlternative={props.confirmRemoveAlternative}
                    tpQ={item.tipo_questao}/>
                );
            default:
        };
    };

    const questionTypeValue = (tpQ) => {
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

    const questionTypeValueDisplay = (item, position) => {
        const defineMaxWidth = () => {
            if(position === 2){
                switch(item.tipo_questao){
                    case 'multipla_escolha':
                        return '23rem';
                    case 'rankeamento':
                        return '22rem';
                    case 'multipla_escolha_com_valores':
                        return '26rem';
                    default:
                }
            }
            else return 'fit-content';
        };


        return (
            <div style={{ maxWidth: defineMaxWidth() }}>
               <div className='p-inputgroup mb-2'>
                    <span className='p-inputgroup-addon'>
                        Question Type:
                    </span>
                    <InputText
                    id={`question-type-[${item.id_questao}]-${position}`}
                    className='text-center'
                    value={questionTypeValue(item.tipo_questao)}
                    style={{
                        width: 'fit-content',
                        fontWeight: 'bold'
                    }}
                    disabled/>
                </div>
                <div className='p-inputgroup'>
                    <span className='p-inputgroup-addon'>
                        Question Value:
                    </span>
                    <InputNumber
                    id={`question-value-[${item.id_questao}]-${position}`}
                    locale='pt-BR'
                    maxFractionDigits={0}
                    min={0}
                    allowEmpty={false}
                    showButtons
                    buttonLayout='horizontal'
                    decrementButtonIcon='pi pi-minus'
                    incrementButtonIcon='pi pi-plus'
                    value={item.valor_questao}
                    onValueChange={e => props.handleQuestionValueChange(e.value, item.id_questao)}
                    pt={{
                        root: {className: 'flex flex-row'},
                        incrementButton: {className: 'dbuttons dbuttons-secondary'},
                        decrementButton: {className: 'dbuttons dbuttons-secondary'},
                    }}/>
                </div> 
            </div>
        )
    };

    return (
        <div>
            {
                transition((style, item) =>
                    item &&
                    <animated.div
                    style={style}
                    className='m-quest-box'
                    key={item.id_questao}>
                        <div className='flex justify-content-between'>
                            <h3>Question {props.questoes.findIndex(questao => questao.id_questao === item.id_questao) + 1}</h3>
                            <button
                            id={`remove-quest-btn-[${item.id_questao}]`}
                            className='dbuttons dbuttons-danger'
                            onClick={e => props.confirmRemoveQuestion(e, item.id_questao, item.tipo_questao)}>
                                X
                            </button>
                        </div>
                        <div className='mt-4 mb-4'>
                            <div className='flex flex-row align-items-center mb-2'>
                                <div className='flex-1 mr-3'>
                                    <label style={{fontSize: '1.3rem'}}><b>Statement</b></label>
                                    <InputTextarea
                                    id={`question-statement-[${item.id_questao}]`}
                                    value={item.enunciado_questao}
                                    onChange={e => props.handleStatementChange(e.target.value, item.id_questao)}/>  
                                </div>
                                <div className=' xl:block lg:block md:hidden sm:hidden'>
                                    {questionTypeValueDisplay(item, 1)}
                                </div>
                            </div>
                            <div className=' xl:hidden lg:hidden md:block sm:block'>
                                {questionTypeValueDisplay(item, 2)}
                            </div>
                        </div>
                        <div className='mb-4'>
                            {buildAlternatives(item)}
                        </div>
                        <div className='flex justify-content-center'>
                            <button
                            id={`add-alt-btn-[${item.id_questao}]`}
                            className='dbuttons dbuttons-secondary pr-3 pl-3'
                            onClick={() => props.addAlternative(item.id_questao, item.tipo_questao)}>
                                <i className='pi pi-plus'/> Add Alternative
                            </button>
                        </div>
                    </animated.div>
                )
            }
        </div>
    );
};

const AlternativesM = (props) => {
    const transition = useTransition(props.alternativesM, springAnimationsConfig);

    const correctRadioButton = (item) => {
        return(
            <div>
                <RadioButton
                id={`radio-btn-correct-[${item.id_questao}]:[${item.id_alternativa}]-1`}
                className='mr-2'
                inputId={`rbCorreta-${item.id_questao}`}
                checked={item.correta}
                onChange={() => props.handleCorrectAlternativeChange(item.id_questao, item.id_alternativa)}/>
                <label htmlFor={`rbCorreta-${item.id_questao}`}>Correct</label>
            </div>
        )
    };

    return (
        <div>
            {
                transition((style, item) =>
                    item &&
                    <animated.div
                    style={style}
                    className='mb-4'
                    key={item.id_alternativa}>
                        <div className='flex flex-row align-items-center mb-3'>
                            <i className='pi pi-circle mr-4'/>
                            <InputTextarea
                            id={`alternative-text-[${item.id_questao}]-[${item.id_alternativa}]`}
                            className='xl:w-6 lg:w-6 md:w-8 sm:w-8 mr-3'
                            value={item.texto_alternativa}
                            onChange={e => props.handleChangeTextoAlternativa(e.target.value, item.id_questao, item.id_alternativa, props.tpQ)}/>
                            <div className='mr-2 xl:block lg:block md:hidden sm:hidden mr-1'>
                                {correctRadioButton(item)}
                            </div>
                            <button
                            id={`remove-alt-btn-[${item.id_questao}]:[${item.id_alternativa}]`}
                            className='dbuttons dbuttons-danger ml-3'
                            onClick={e => props.confirmRemoveAlternative(e, item.id_questao, item.id_alternativa, props.tpQ)}>
                                X
                            </button>
                        </div>
                        <div className='xl:hidden lg:hidden md:block sm:block'>
                            <div className='flex flex-row align-items-center'>
                                <i className='pi pi-circle-on mr-4' style={{color: 'transparent'}}/>
                                {correctRadioButton(item)}
                            </div>
                        </div>
                    </animated.div>
                )
            }
        </div>
    );
};

const AlternativesMV = (props) => {
    const transition = useTransition(props.alternativesMV, springAnimationsConfig);

    const percentageInput = (item) => {
        return(
            <div className='p-inputgroup max-w-23rem'>
                <span className='p-inputgroup-addon'>
                    Score Percentage:
                </span>
                <InputNumber
                id={`alternative-percentage-[${item.id_questao}]:[${item.id_alternativa}]-2`}
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
                onValueChange={e => props.handleAlternativePercentageChange(e.value, item.id_questao, item.id_alternativa)}
                pt={{
                    root: {className: 'flex flex-row'},
                    incrementButton: {className: 'dbuttons dbuttons-secondary'},
                    decrementButton: {className: 'dbuttons dbuttons-secondary'},
                }}/>
            </div>
        )
    }

    return (
        <div>
            {
                transition((style, item) =>
                    item &&
                    <animated.div
                    style={style}
                    className='mb-4'
                    key={item.id_alternativa}>
                        <div className='flex flex-row align-items-center mb-2'>
                            <i className='pi pi-circle mr-4'/>
                            <InputTextarea
                            id={`alternative-text-[${item.id_questao}]:[${item.id_alternativa}]`}
                            className='xl:w-6 lg:w-6 md:w-8 sm:w-8 mr-3'
                            value={item.texto_alternativa}
                            onChange={e => props.handleChangeTextoAlternativa(e.target.value, item.id_questao, item.id_alternativa, props.tpQ)}/>
                            <div className='flex mr-2 xl:block lg:hidden md:hidden sm:hidden'>
                                {percentageInput(item)}
                            </div>
                            <button
                            id={`remove-alt-btn-[${item.id_questao}]-[${item.id_alternativa}]`}
                            className='dbuttons dbuttons-danger ml-3'
                            onClick={e => props.confirmRemoveAlternative(e, item.id_questao, item.id_alternativa, props.tpQ)}>
                                X
                            </button>
                        </div>
                        <div className='xl:hidden lg:block md:block sm:block'>
                            <div className='flex flex-row align-items-center'>
                               <i className='pi pi-circle-on mr-4' style={{color: 'transparent'}}/>
                               {percentageInput(item)}
                            </div>
                        </div>
                    </animated.div>
                )
            }
        </div>
    );
};

const AlternativesR = (props) => {
    const transition = useTransition(props.alternativesR, springAnimationsConfig);

    const valueInput = (item) => {
        return(
            <div className='p-inputgroup max-w-21rem'>
                <span className='p-inputgroup-addon'>
                    Alternative Value:
                </span>
                <InputNumber
                id={`alternative-value-[${item.id_questao}]:[${item.id_alternativa}]-1`}
                locale='en-US'
                maxFractionDigits={0}
                min={0}
                allowEmpty={false}
                showButtons
                buttonLayout='horizontal'
                decrementButtonIcon='pi pi-minus'
                incrementButtonIcon='pi pi-plus'
                value={item.valor_alternativa}
                onValueChange={e => props.handleAlternativeValueChange(e.value, item.id_questao, item.id_alternativa)}
                pt={{
                    root: {className: 'flex flex-row'},
                    incrementButton: {className: 'dbuttons dbuttons-secondary'},
                    decrementButton: {className: 'dbuttons dbuttons-secondary'},
                }}/>
            </div>
        )
    };

    return (
        <div>
            {
                transition((style, item) =>
                    item &&
                    <animated.div
                    className=' mb-4'
                    style={style}
                    key={item.id_alternativa}>
                        <div className='flex flex-row align-items-center mb-2'>
                            <i className='pi pi-circle mr-4'/>
                            <InputTextarea
                            id={`alternative-text-[${item.id_questao}]:[${item.id_alternativa}]`}
                            className='xl:w-6 lg:w-6 md:w-8 sm:w-8 mr-3'
                            value={item.texto_alternativa}
                            onChange={e => props.handleChangeTextoAlternativa(e.target.value, item.id_questao, item.id_alternativa, props.tpQ)}/>
                            <div className='flex mr-2 xl:block lg:hidden md:hidden sm:hidden'>
                                {valueInput(item)}
                            </div>
                            <button
                            id={`remove-alt-btn-[${item.id_questao}]:[${item.id_alternativa}]`}
                            className='dbuttons dbuttons-danger ml-3'
                            onClick={e => props.confirmRemoveAlternative(e, item.id_questao, item.id_alternativa, props.tpQ)}>
                                X
                            </button>
                        </div>
                        <div className='xl:hidden lg:block md:block sm:block'>
                            <div className='flex flex-row align-items-center'>
                                <i className='pi pi-circle-on mr-4' style={{color: 'transparent'}}/>
                                {valueInput(item)}
                            </div>
                        </div>
                    </animated.div>
                )
            }
        </div>
    );
};

export default protectRoute(ManageTest);