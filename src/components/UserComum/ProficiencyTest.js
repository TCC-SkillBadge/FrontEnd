import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Divider } from 'primereact/divider';
import { useNavigate } from 'react-router-dom';
import { roundScore } from '../../utils/general-functions/RoundScore';
import { selectionSortObject } from '../../utils/general-functions/SelectionSortObject';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RadioButton } from 'primereact/radiobutton';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ResultChart } from './ResultScreen';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import { protectRoute } from '../../utils/general-functions/ProtectRoutes';
import { jwtExpirationHandler } from '../../utils/general-functions/JWTExpirationHandler';
import '../../styles/ProficiencyTest.css';
import '../../styles/GlobalStylings.css';

const generalServicesURL = process.env.REACT_APP_API_SOFTSKILL;
const commomUrl = process.env.REACT_APP_API_COMUM;

const baseUrlGeneralServicesSS = axios.create({
    baseURL: `${generalServicesURL}/softskills`
});

const baseUrlGeneralServicesTest = axios.create({
    baseURL: `${generalServicesURL}/teste`
});

const baseURLUC = axios.create({
    baseURL: `${commomUrl}/api`
});

export const ProficiencyTest = () => {
    const [token, _setToken] = useState(sessionStorage.getItem('token'));
    const [userType, _setUserType] = useState(sessionStorage.getItem('tipoUsuario'));
    const [userInfo, _setUserInfo] = useState(JSON.parse(sessionStorage.getItem('userInfo')));
    const [userEmail, _setUserEmail] = useState(userInfo.email);

    const [softSkills, setSoftSkills] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allFine, setAllFine] = useState(true);
    const [timerMinutes, setTimerMinutes] = useState(35);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [loadingResults, setLoadingResults] = useState(false);
    const [startTest, setStartTest] = useState(false);
    const [alreadyTaken, setAlreadyTaken] = useState(false);
    const [lastScores, setLastScores] = useState([]);
    const [lastTestDate, setLastTestDate] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    //Iniciating the page
    useEffect(() => {
        mountPage();
    }, []);

    useEffect(() => {
        if (!startTest) return;
        const interval = setInterval(() => {
            setTimerSeconds((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [startTest]);

    useEffect(() => {
        if (timerSeconds === -1) {
            setTimerMinutes((prev) => prev - 1);
            setTimerSeconds(59);
        }
        if (timerMinutes === 0 && timerSeconds === 0) finalize();
    }, [timerSeconds, timerMinutes]);

    useEffect(() => {
        if (startTest) {
            window.onbeforeunload = (e) => {
                e.preventDefault();
                e.returnValue = '';
            };
        }

        return () => {
            window.onbeforeunload = null;
        };
    }, [startTest]);

    const mountPage = () => {
        //Verification of the last test date
        const verifyLastTest = async () => {
            try {
                const response = (await baseURLUC.get('/user/verify-last-test',
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { email_user: userEmail }
                    }
                )).data;

                if (response.length !== 0) {
                    const lastTestDateAux = new Date(response[0].dt_realizacao);
                    console.log(lastTestDateAux);
                    const diffInDays = (new Date() - lastTestDateAux) / (1000 * 60 * 60 * 24);

                    if (diffInDays < 7) {
                        const lastScoresAux = response.map((result) => {
                            return {
                                id_soft_skill: result.id_soft_skill,
                                nome_soft_skill: result.nome_soft_skill,
                                descricao_soft_skill: result.descricao_soft_skill,
                                cor_soft_skill: result.cor_soft_skill,
                                data_realizacao: result.dt_realizacao,
                                notaShow: roundScore((result.nota / result.nota_max) * 100)
                            };
                        });

                        setAlreadyTaken(() => true);
                        setLastScores(() => lastScoresAux);
                        setLoading(() => false);
                        setLastTestDate(() => lastTestDateAux);
                        return Promise.reject();
                    }
                }

                return Promise.resolve();
            }
            catch (error) {
                const msg = handleRequestError(error);
                setError(msg);
                setAllFine(false);
                setLoading(false);
                return Promise.reject();
            }
        };

        //Fetch Soft Skills and Test methods
        const fetchSoftSkills = async () => {
            try {
                const response = (await baseUrlGeneralServicesSS.get('/listar',
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { tipoUsuario: userType }
                    }
                )).data;
                return Promise.resolve(response);
            }
            catch (error) {
                const msg = handleRequestError(error);
                return Promise.reject(msg);
            }
        };

        const fetchTestData = async () => {
            try {
                const response = (await baseUrlGeneralServicesTest.get('/fetch',
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { tipoUsuario: userType }
                    }
                )).data;
                const {
                    questoes,
                    alternativasMultiplaEscolha,
                    alternativasRankeamento,
                    alternativasMultiplaEscolhaComValores
                } = response;
                return Promise.resolve({ questoes, alternativasMultiplaEscolha, alternativasRankeamento, alternativasMultiplaEscolhaComValores });
            }
            catch (error) {
                const msg = handleRequestError(error);
                return Promise.reject(msg);
            }
        };

        const mountTest = async () => {
            try {
                const auxSSs = await fetchSoftSkills();
                const response = await fetchTestData();
                const {
                    questoes,
                    alternativasMultiplaEscolha,
                    alternativasRankeamento,
                    alternativasMultiplaEscolhaComValores
                } = response;

                const SSs = [];
                for (let i = 0; i < auxSSs.length; i++) {
                    for (let j = 0; j < questoes.length; j++) {
                        if (auxSSs[i].id_soft_skill === questoes[j].id_soft_skill) {
                            SSs.push(auxSSs[i]);
                            break;
                        }
                    }
                };

                const resps = [];
                const alts = [
                    { tpQ: 'multipla_escolha', alts: [...alternativasMultiplaEscolha] },
                    { tpQ: 'rankeamento', alts: [...alternativasRankeamento] },
                    { tpQ: 'multipla_escolha_com_valores', alts: [...alternativasMultiplaEscolhaComValores] }
                ];
                for (let i = 0; i < alts.length; i++) {
                    for (let j = 0; j < questoes.length; j++) {
                        if (questoes[j].tipo_questao === alts[i].tpQ) {
                            const aux = alts[i].alts.filter((alt) => alt.id_questao === questoes[j].id_questao);
                            if (alts[i].tpQ === 'multipla_escolha' || alts[i].tpQ === 'multipla_escolha_com_valores') {
                                for (let k = 0; k < aux.length; k++) {
                                    aux[k].escolha_feita = false;
                                }
                            }
                            const resp = {
                                ...questoes[j],
                                alternativas: aux
                            };
                            resps.push(resp);
                        }
                    };
                };

                setAnswers(resps);
                setSoftSkills(SSs);
            }
            catch (error) {
                setError(error);
                setAllFine(false);
            }
            finally {
                setLoading(false);
            }
        };

        //Iniciation of the process
        verifyLastTest().then(() => mountTest()).catch(() => { });
    };

    const userrFinalize = () => {
        if (doVerifications()) finalize();
    }

    const doVerifications = () => {
        for (let i = 0; i < answers.length; i++) {
            if (answers[i].tipo_questao === 'multipla_escolha' || answers[i].tipo_questao === 'multipla_escolha_com_valores') {
                const escolhas = answers[i].alternativas.filter((alt) => alt.escolha_feita);
                if (escolhas.length === 0) {
                    toast.error(`Answer all questions before finishing the test!`);
                    return false;
                }
            }
        }
        return true;
    }

    const finalize = () => {
        const { resultShow, resultSend } = calculateScores();

        setLoadingResults(true);
        baseURLUC.post('/user/register-test-scores', {
            email_user: userEmail,
            resultados: resultSend,
            dt_realizacao: new Date()
        })
            .then(() => {
                setTimeout(() => {
                    window.onbeforeunload = null;
                    setLoadingResults(false);
                    navigate(`/result-screen`, { state: resultShow });
                }, 2000);
            })
            .catch((error) => {
                setLoadingResults(false);
                let msg;
                if (error.response) msg = error.response.data.message;
                else if (error.request) msg = 'Error while trying to access the server!';
                toast.error(msg);
            });
    };

    const calculateScores = () => {
        const getMaxSoftSkillScores = (SSs) => {
            const maxScores = [];
            for (let i = 0; i < SSs.length; i++) {
                const obj = {
                    id_soft_skill: SSs[i].id_soft_skill,
                    maxNota: SSs[i].max_nota_soft_skill
                };
                maxScores.push(obj);
            }
            return maxScores;
        };

        const NM = getMaxSoftSkillScores(softSkills);

        const calculateFinalScores = (SSs, resps) => {
            const finalScores = [];
            for (let i = 0; i < SSs.length; i++) {
                let aux = 0;
                for (let j = 0; j < resps.length; j++) {
                    if (SSs[i].id_soft_skill === resps[j].id_soft_skill) {
                        switch (resps[j].tipo_questao) {
                            case 'multipla_escolha':
                                let isCorrect = false;
                                for (let k = 0; k < resps[j].alternativas.length; k++) {
                                    if (resps[j].alternativas[k].correta && resps[j].alternativas[k].escolha_feita) isCorrect = true;
                                }
                                if (isCorrect) aux += resps[j].valor_questao;
                                break;
                            case 'rankeamento':
                                const auxAlternatives = selectionSortObject(resps[j].alternativas, 'valor_alternativa');
                                const maxCombinacao = (array) => {
                                    let max = 0;
                                    for (let k = 0; k < array.length; k++) {
                                        max += array[k].valor_alternativa * ((array.length - 1) - k);
                                    }
                                    return max;
                                };
                                const max = maxCombinacao(auxAlternatives);
                                const contarPontos = (array) => {
                                    let nota = 0;
                                    for (let k = 0; k < array.length; k++) {
                                        nota += array[k].valor_alternativa * ((array.length - 1) - k);
                                    }
                                    return nota;
                                };
                                const points = contarPontos(resps[j].alternativas);
                                const scoreRatio = points / max;
                                const auxScore = resps[j].valor_questao * scoreRatio;
                                aux += roundScore(auxScore);
                                break;
                            case 'multipla_escolha_com_valores':
                                for (let k = 0; k < resps[j].alternativas.length; k++) {
                                    if (resps[j].alternativas[k].escolha_feita) {
                                        const result = resps[j].alternativas[k].porcentagem * resps[j].valor_questao / 100;
                                        aux += roundScore(result);
                                    }
                                };
                            default:
                        };
                    }
                }
                const obj = {
                    id_soft_skill: SSs[i].id_soft_skill,
                    notaF: aux
                };
                finalScores.push(obj);
            }
            return finalScores;
        };

        const NF = calculateFinalScores(softSkills, answers);

        const mountResults = (NM, NF, SSs) => {
            const resultShow = [], resultSend = [];
            for (let i = 0; i < SSs.length; i++) {
                const notaShow = roundScore((NF[i].notaF / NM[i].maxNota) * 100);
                const obj1 = {
                    id_soft_skill: SSs[i].id_soft_skill,
                    nome_soft_skill: SSs[i].nome_soft_skill,
                    descricao_soft_skill: SSs[i].descricao_soft_skill,
                    cor_soft_skill: SSs[i].cor_soft_skill,
                    notaShow
                };
                resultShow.push(obj1);

                const obj2 = {
                    id_soft_skill: SSs[i].id_soft_skill,
                    nome_soft_skill: SSs[i].nome_soft_skill,
                    cor_soft_skill: SSs[i].cor_soft_skill,
                    nota: NF[i].notaF,
                    nota_max: NM[i].maxNota
                };
                resultSend.push(obj2);
            }
            return { resultShow, resultSend };
        };

        const { resultShow, resultSend } = mountResults(NM, NF, softSkills);

        return { resultShow, resultSend };
    };

    const handleSelectionChange = (idQ, idA) => {
        const answs = [...answers];
        const answ = answs.find((resp) => resp.id_questao === idQ);

        const alts = answ.alternativas;
        for (let i = 0; i < alts.length; i++) {
            if (alts[i].escolha_feita) {
                alts[i].escolha_feita = false;
            }
        }

        const alt = answ.alternativas.find((alt) => alt.id_alternativa === idA);
        alt.escolha_feita = true;
        setAnswers(answs);
    }

    const handleOrderChange = (idQ, alts) => {
        const resps = [...answers];
        const resp = resps.find((resp) => resp.id_questao === idQ);
        resp.alternativas = alts;
        setAnswers(resps);
    };

    const handleRequestError = (error) => {
        let msg = '';
        if (error.response) {
            msg = error.response.data.message
            if (error.response.data.type === 'TokenExpired') jwtExpirationHandler();
        }
        else if (error.request) msg = 'Error while trying to access server!'
        return msg;
    };

    return (
        <div>
            <div className='d-test-box'>
                <h1>Competency Test</h1>
                <Divider />
                {
                    startTest &&
                    <div>
                        <div className='flex flex-row justify-content-between'>
                            <div>
                                The test has a duration of 35 minutes.
                            </div>
                            <div>
                                <i className='pi pi-clock mr-2' />
                                <span>{timerMinutes < 10 ? `0${timerMinutes}` : timerMinutes}:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
                            </div>
                        </div>
                        <div className='d-test-skill-box'>
                            {
                                softSkills.map((softSkill) => {
                                    const answs = answers.filter((resp) => resp.id_soft_skill === softSkill.id_soft_skill);
                                    return (
                                        <div key={softSkill.id_soft_skill}>
                                            <h2 className='text-center'>{softSkill.nome_soft_skill}</h2>
                                            {
                                                answs.map((answ) => {
                                                    return (
                                                        <Answer
                                                            key={answ.id_questao}
                                                            answer={answ}
                                                            handleSelectionChange={handleSelectionChange}
                                                            handleOrderChange={handleOrderChange} />
                                                    );
                                                })
                                            }
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <div className='flex flex-row justify-content-between'>
                            <button
                                className='dbuttons dbuttons-danger pr-4 pl-4'
                                onClick={() => window.location.replace('/')}
                                style={{
                                    fontSize: 'calc(15px + 0.6vw)',
                                    fontWeight: 'bold'
                                }}>
                                Cancel
                            </button>
                            <button
                                className='dbuttons dbuttons-success pr-4 pl-4'
                                onClick={userrFinalize}
                                style={{
                                    fontSize: 'calc(15px + 0.6vw)',
                                    fontWeight: 'bold'
                                }}>
                                Finish
                            </button>
                        </div>
                    </div>
                }
            </div>

            <CalculatingResultsBox
                loadingResults={loadingResults}
                setLoadingResults={setLoadingResults} />

            <GreetingsModal
                startTest={startTest}
                loading={loading}
                setLoading={setLoading}
                allFine={allFine}
                alreadyTaken={alreadyTaken}
                lastScores={lastScores}
                setStartTest={setStartTest}
                lastTestDate={lastTestDate}
                error={error} />

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
                theme="dark" />

            <ConfirmDialog />
        </div>
    )
};

const Answer = (props) => {
    const answer = props.answer;

    const mountAlternatives = (tpQ) => {
        switch (tpQ) {
            case 'multipla_escolha':
                return (
                    <AlternativesM
                        alternatives={answer.alternativas}
                        handleSelectionChange={props.handleSelectionChange} />
                );
            case 'rankeamento':
                return (
                    <AlternativesR
                        questionID={answer.id_questao}
                        alternatives={answer.alternativas}
                        handleOrderChange={props.handleOrderChange} />
                )
            case 'multipla_escolha_com_valores':
                return (
                    <AlternativesMV
                        alternatives={answer.alternativas}
                        handleSelectionChange={props.handleSelectionChange} />
                )
            default:
        };
    };

    return (
        <div className='d-question-box'>
            <div className='mb-4' key={answer.id_questao}>
                <h3 className='mb-3'>{answer.enunciado_questao}</h3>
                {mountAlternatives(answer.tipo_questao)}
            </div>
        </div>
    )
};

const AlternativesM = (props) => {
    return (
        <div>
            {
                props.alternatives.map((alt) => {
                    return (
                        <div className='flex flex-row align-items-center' key={alt.id_alternativa}>
                            <RadioButton
                                id={`M-question-selection-rb-${alt.id_questao}:${alt.id_alternativa}`}
                                className='mr-3'
                                checked={alt.escolha_feita}
                                onChange={() => props.handleSelectionChange(alt.id_questao, alt.id_alternativa)} />
                            <label htmlFor={`rb-${alt.id_questao}:${alt.id_alternativa}`}>
                                <h4>{alt.texto_alternativa}</h4>
                            </label>
                        </div>
                    );
                })
            }
        </div>
    )
};

const AlternativesMV = (props) => {
    return (
        <div>
            {
                props.alternatives.map((alt) => {
                    return (
                        <div className='flex flex-row align-items-center' key={alt.id_alternativa}>
                            <RadioButton
                                id={`MV-question-selection-rb-${alt.id_questao}:${alt.id_alternativa}`}
                                className='mr-3'
                                checked={alt.escolha_feita}
                                onChange={() => props.handleSelectionChange(alt.id_questao, alt.id_alternativa)} />
                            <h4>{alt.texto_alternativa}</h4>
                        </div>
                    );
                })
            }
        </div>
    )
};

const AlternativesR = (props) => {
    useEffect(() => {
        console.log('AlternativesR Mounted');
        console.log(props);
    }, []);

    const onDragEnd = (result) => {
        const { destination, source } = result;

        if (!destination) return;
        if (destination.index === source.index) return;

        const newAlts = [...props.alternatives];
        const alt = newAlts[source.index];
        newAlts.splice(source.index, 1);
        newAlts.splice(destination.index, 0, alt);

        props.handleOrderChange(props.questionID, newAlts);
    };

    return (
        <div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={`${props.questionID}`} direction='vertical'>
                    {
                        (provided) => (
                            <div
                                id={`R-question-alternatives-${props.questionID}`}
                                ref={provided.innerRef}
                                {...provided.droppableProps}>
                                {
                                    props.alternatives.map((alt, index) => {
                                        return (
                                            <AltR
                                                key={alt.id_alternativa}
                                                alt={alt}
                                                index={index} />
                                        );
                                    })
                                }
                                {provided.placeholder}
                            </div>
                        )
                    }
                </Droppable>
            </DragDropContext>
        </div>
    )
};

const AltR = ({ alt, index }) => {
    return (
        <Draggable draggableId={`${alt.id_questao}:${alt.id_alternativa}`} index={index}>
            {
                (provided) => (
                    <div
                        id={`R-question-alternative-${alt.id_questao}:${alt.id_alternativa}`}
                        className='alts-r flex flex-row align-items-center p-4'
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}>
                        <h4>{alt.texto_alternativa}</h4>
                    </div>
                )
            }
        </Draggable>

    )
};

const CalculatingResultsBox = ({ loadingResults, setLoadingResults }) => {
    return (
        <Dialog
            className='loading-box default-border-image'
            visible={loadingResults}
            draggable={false}
            closable={false}
            onHide={() => { if (!loadingResults) return; setLoadingResults(() => false); }}
            contentStyle={{
                overflow: loadingResults ? 'hidden' : 'auto',
            }}>
            <Loading show={loadingResults} msg='Calculating Results...' />
        </Dialog>
    );
};

const GreetingsModal = ({ startTest, loading, setLoading, allFine, alreadyTaken, lastScores, setStartTest, lastTestDate, error }) => {
    const alreadyTakenAlert = () => {
        return (
            <div>
                <h1 className='text-center'>Test Done</h1>
                <Divider />
                <div className='show-results-box'>
                    <div style={{ fontSize: 'calc(0.8rem + 1vw)' }}>
                        <p>You've already taken the test this week. Wait at least 7 days to take it again.</p>
                        <p>Here are your last scores:</p>
                    </div>
                    <div className='flex flex-column align-items-center'>
                        <ResultChart resultShow={lastScores} />
                        <h4 className='mt-4'>Date of Realization: {new Date(lastTestDate).toLocaleDateString()}</h4>
                        <button
                            id='test-return-home-already-taken-btn'
                            style={{ fontSize: 'calc(0.8rem + 1vw)' }}
                            className='dbuttons dbuttons-primary mt-3 pl-5 pr-5'
                            onClick={() => window.location.replace('/')}>
                            Return to Home Page
                        </button>
                    </div>
                </div>
            </div>
        )
    };

    const startTestAlert = () => {
        return (
            <div>
                <h1 className='text-center'>The Test is about to Start</h1>
                <Divider />
                <div style={{ fontSize: 'calc(0.8rem + 1vw)' }}>
                    <p>
                        This test will evaluate your proficiency in a series of Soft Skills,
                        which are certain socio-behavioural abilities extremely valued nowadays
                        in a myriad of different environments.
                    </p>
                    <p>You have 35 minutes to complete it.</p>
                    <p>Press Start to inciate it.</p>
                    <p><b>Good Luck!</b></p>
                    <div className='flex flex-column align-items-center'>
                        <button
                            id='test-start-btn'
                            style={{ fontSize: 'calc(0.8rem + 1vw)' }}
                            className='dbuttons dbuttons-success w-4'
                            onClick={() => setStartTest(() => true)}>
                            Start
                        </button>
                        <button
                            id='test-return-home-start-test-btn'
                            style={{ fontSize: 'calc(0.8rem + 1vw)' }}
                            className='dbuttons dbuttons-primary mt-3 w-4'
                            onClick={() => window.location.replace('/')}>
                            Return to Home Page
                        </button>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <Dialog
            className='loading-box default-border-image'
            visible={!startTest}
            closable={false}
            draggable={false}
            onHide={() => { if (startTest) return; setLoading(() => true); }}
            contentStyle={{
                overflow: 'hidden',
            }}>
            <Loading show={loading} msg='Loading Test...' />
            {
                loading ?
                    null :
                    (
                        allFine ?
                            (
                                alreadyTaken ?
                                    alreadyTakenAlert() :
                                    startTestAlert()
                            ) :
                            <ErrorMessage msg={error} />
                    )
            }
        </Dialog>
    );
};

export default protectRoute(ProficiencyTest);