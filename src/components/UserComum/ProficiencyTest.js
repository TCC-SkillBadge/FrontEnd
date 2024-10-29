import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import Navbar from "../Navbar";
import { Divider } from 'primereact/divider';
import { useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import { roundScore } from '../../utils/general-functions/RoundScore';
import { selectionSortObject } from '../../utils/general-functions/SelectionSortObject';
import { Messages } from 'primereact/messages';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RadioButton } from 'primereact/radiobutton';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { Dialog } from 'primereact/dialog';
import { confirmPopup } from 'primereact/confirmpopup';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ResultChart } from './ResultScreen';
import '../../styles/ProficiencyTest.css';

const baseUrlServicosGeraisSS = axios.create({
    baseURL: 'http://localhost:6004/softskills'
});

const baseUrlServicosGeraisTeste = axios.create({
    baseURL: 'http://localhost:6004/teste'
});

const baseURLUC = axios.create({
    baseURL: 'http://localhost:7000/api'
});

export const ProficiencyTest = () => {
    const [softSkills, setSoftSkills] = useState([]);
    const [respostas, setRespostas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allFine, setAllFine] = useState(true);
    const [timerMinutes, setTimerMinutes] = useState(35);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [loadingResults, setLoadingResults] = useState(false);
    const [startTest, setStartTest] = useState(false);
    const [alreadyTaken, setAlreadyTaken] = useState(false);
    const [lastScores, setLastScores] = useState([]);
    
    const navigate = useNavigate();

    let messages = useRef(null);

    const token = sessionStorage.getItem('token');
    const userType = sessionStorage.getItem('tipoUsuario');
    const userInfo = sessionStorage.getItem('userInfo');

    useEffect(() => {
        if(!token || !userType || !userInfo){
            toast.error(`Unauthenticated user! You won't be able to actualize your operations while you are not properly logged in!`);
            return;
        }

        const { email } = JSON.parse(userInfo);

        //Verification of the last test date
        const verifyLastTest = async () => {
            try{
                const response = (await baseURLUC.get('/user/verify-last-test',
                    {
                        headers: {Authorization: `Bearer ${token}`},
                        params: {email_user: email}
                    }
                )).data;
    
                if(response.length !== 0){
                    const lastTestDate = new Date(response[0].dt_realizacao);
                    console.log(lastTestDate);
                    const diffInDays = (new Date() - lastTestDate) / (1000 * 60 * 60 * 24);
    
                    if(diffInDays < 7){
                        const lastScoresAux = response.map((result) => {
                            return {
                                id_soft_skill: result.id_soft_skill,
                                nome_soft_skill: result.nome_soft_skill,
                                descricao_soft_skill: result.descricao_soft_skill,
                                cor_soft_skill: result.cor_soft_skill,
                                notaShow: roundScore((result.nota / result.nota_max) * 100)
                            };
                        });
    
                        setAlreadyTaken(() => true);
                        setLastScores(() => lastScoresAux);
                        setLoading(() => false);
                        return Promise.reject();
                    }
                }

                return Promise.resolve();
            }
            catch(error){
                let msg;
                if(error.response) msg = error.response.data.message;
                else if(error.request) msg = 'Error while trying to access the server!';
                messages.replace({severity: 'error', summary: 'Erro', detail: `${msg}`, sticky: true, closable: false});
                setAllFine(false);
                setLoading(false);
                return Promise.reject();
            }
        };

        //Fetch Soft Skills and Test methods
        const fetchSoftSkills = async () => {
            try{
                const response = (await baseUrlServicosGeraisSS.get('/listar',
                    {
                        headers: {Authorization: `Bearer ${token}`},
                        params: {tipoUsuario: userType}
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

        const fetchTeste = async () => {
            try{
                const response = (await baseUrlServicosGeraisTeste.get('/fetch',
                    {
                        headers: {Authorization: `Bearer ${token}`},
                        params: {tipoUsuario: userType}
                    }
                )).data;
                const {
                    questoes,
                    alternativasMultiplaEscolha,
                    alternativasRankeamento,
                    alternativasMultiplaEscolhaComValores
                } = response;
                return Promise.resolve({questoes, alternativasMultiplaEscolha, alternativasRankeamento, alternativasMultiplaEscolhaComValores});
            }
            catch(error){
                let msg
                if(error.response) msg = error.response.data.message
                else if(error.request) msg = 'Error while trying to access the server!'
                return Promise.reject(msg);
            }
        };

        const mountTest = async () => {
            try{
                const auxSSs = await fetchSoftSkills();
                const response = await fetchTeste();
                const {
                    questoes,
                    alternativasMultiplaEscolha,
                    alternativasRankeamento,
                    alternativasMultiplaEscolhaComValores
                } = response;
                
                const SSs = [];
                for(let i = 0; i < auxSSs.length; i++){
                    for(let j = 0; j < questoes.length; j++){
                        if(auxSSs[i].id_soft_skill === questoes[j].id_soft_skill){
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
                for(let i= 0; i < alts.length; i++){
                    for(let j = 0; j < questoes.length; j++){
                        if(questoes[j].tipo_questao === alts[i].tpQ){
                            const aux = alts[i].alts.filter((alt) => alt.id_questao === questoes[j].id_questao);
                            if(alts[i].tpQ === 'multipla_escolha' || alts[i].tpQ === 'multipla_escolha_com_valores'){
                                for(let k = 0; k < aux.length; k++){
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
    
                setRespostas(resps);
                setSoftSkills(SSs);
            }
            catch(error){
                messages.replace({severity: 'error', summary: 'Erro', detail: `${error}`, sticky: true, closable: false});
                setAllFine(false);
            }
            finally{
                setLoading(false);
            }
        };

        //Iniciation of the process
        verifyLastTest().then(() => mountTest()).catch(() => {}) ;
    }, []);

    useEffect(() => {
        if(!startTest) return;
        const interval = setInterval(() => {
            setTimerSeconds((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [startTest]);

    useEffect(() => {
        if(timerSeconds === -1){
            setTimerMinutes((prev) => prev - 1);
            setTimerSeconds(59);
        }
        if(timerMinutes === 0 && timerSeconds === 0) finalizar();
    }, [timerSeconds, timerMinutes]);
    
    const finalizarDoUsuario = () => {
        if(realizarVerificacoes()) finalizar();
    }

    const realizarVerificacoes = () => {
        for(let i = 0; i < respostas.length; i++){
            if(respostas[i].tipo_questao === 'multipla_escolha' || respostas[i].tipo_questao === 'multipla_escolha_com_valores'){
                const escolhas = respostas[i].alternativas.filter((alt) => alt.escolha_feita);
                if(escolhas.length === 0){
                    toast.error(`Answer all questions before finishing the test!`);
                    return false;
                }
            }
        }
        return true;
    }

    const finalizar = () => {
        const { resultShow, resultSend } = calcularNotas();
        
        const email_user = JSON.parse(userInfo).email;

        setLoadingResults(true);
        baseURLUC.post('/user/register-test-scores', {
            email_user,
            resultados: resultSend,
            dt_realizacao: new Date()
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(() => {
            setTimeout(() => {
                setLoadingResults(false);
                navigate(`/result-screen`, { state: resultShow });
            }, 2000);
        })
        .catch((error) => {
            setLoadingResults(false);
            let msg;
            if(error.response) msg = error.response.data.message;
            else if(error.request) msg = 'Error while trying to access the server!';
            toast.error(msg);
        });
    };

    const calcularNotas = () => {
        const pegarNotasMaximas = (SSs) => {
            const notasMaximas = [];
            for(let i = 0; i < SSs.length; i++){
                const obj = {
                    id_soft_skill: SSs[i].id_soft_skill,
                    maxNota: SSs[i].max_nota_soft_skill
                };
                notasMaximas.push(obj);
            }
            return notasMaximas;
        };

        const NM = pegarNotasMaximas(softSkills);

        const calcularNotasFinais = (SSs, resps) => {
            const notasFinais = [];
            for(let i = 0; i < SSs.length; i++){
                let aux = 0;
                for(let j = 0; j < resps.length; j++){
                    if(SSs[i].id_soft_skill === resps[j].id_soft_skill){
                       switch(resps[j].tipo_questao){
                            case 'multipla_escolha':
                                let acertou = false;
                                for(let k = 0; k < resps[j].alternativas.length; k++){
                                    if(resps[j].alternativas[k].correta && resps[j].alternativas[k].escolha_feita) acertou = true;
                                }
                                if(acertou) aux += resps[j].valor_questao;
                                break;
                            case 'rankeamento':
                                const auxAlternativas = selectionSortObject(resps[j].alternativas, 'valor_alternativa');
                                const maxCombinacao = (array) => {
                                    let max = 0;
                                    for(let k = 0; k < array.length; k++){
                                        max += array[k].valor_alternativa * ((array.length - 1) - k);
                                    }
                                    return max;
                                };
                                const max = maxCombinacao(auxAlternativas);
                                const contarPontos = (array) => {
                                    let nota = 0;
                                    for(let k = 0; k < array.length; k++){
                                        nota += array[k].valor_alternativa * ((array.length - 1) - k);
                                    }
                                    return nota;
                                };
                                const pontos = contarPontos(resps[j].alternativas);
                                const porcentagem = pontos / max;
                                const auxNota = resps[j].valor_questao * porcentagem;
                                aux += roundScore(auxNota);
                                break;
                            case 'multipla_escolha_com_valores':
                                for(let k = 0; k < resps[j].alternativas.length; k++){
                                    if(resps[j].alternativas[k].escolha_feita){
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
                notasFinais.push(obj);
            }
            return notasFinais;
        };

        const NF = calcularNotasFinais(softSkills, respostas);

        const montarResultados = (NM, NF, SSs) => {
            const resultShow = [], resultSend = [];
            for(let i = 0; i < SSs.length; i++){
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

        const { resultShow, resultSend } = montarResultados(NM, NF, softSkills);

        return { resultShow, resultSend };
    };

    const confimarCancelar = (e) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to cancel the test?',
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => window.location.replace('/'),
        });
    };

    const handleChangeEscolhaFeita = (idQ, idA) => {
        const resps = [...respostas];
        const resp = resps.find((resp) => resp.id_questao === idQ);
        
        const alts = resp.alternativas;
        for(let i = 0; i < alts.length; i++){
            if(alts[i].escolha_feita){
                alts[i].escolha_feita = false;
            }
        }

        const alt = resp.alternativas.find((alt) => alt.id_alternativa === idA);
        alt.escolha_feita = true;
        setRespostas(resps);
    }

    const handleChangeOrdem = (idQ, alts) => {
        const resps = [...respostas];
        const resp = resps.find((resp) => resp.id_questao === idQ);
        resp.alternativas = alts;
        setRespostas(resps);
    };

    return (
        <div>
            <Navbar/>
            <div className='d-test-box'>
                <h1>Competency Test</h1>
                <Divider/>
                {
                    startTest &&
                    <div>
                        <div className='flex flex-row justify-content-between'>
                            <div>
                                The test has a duration of 35 minutes.
                            </div>
                            <div>
                                <i className='pi pi-clock mr-2'/>
                                <span>{timerMinutes < 10 ? `0${timerMinutes}` : timerMinutes}:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
                            </div>
                        </div>
                        <div className='d-test-skill-box'>
                            {
                                softSkills.map((softSkill) => {
                                    const resps = respostas.filter((resp) => resp.id_soft_skill === softSkill.id_soft_skill);
                                    return (
                                        <div key={softSkill.id_soft_skill}>
                                            <h2 className='text-center'>{softSkill.nome_soft_skill}</h2>
                                            {
                                                resps.map((resp) => {
                                                    return (
                                                        <Answer
                                                        key={resp.id_questao}
                                                        resposta={resp}
                                                        handleChangeEscolhaFeita={handleChangeEscolhaFeita}
                                                        handleChangeOrdem={handleChangeOrdem}/>
                                                    );
                                                })
                                            }
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <div className='flex flex-row justify-content-between'>
                            <button className='btn btn-danger' onClick={(e) => confimarCancelar(e)}>Cancel</button>
                            <button className='btn btn-success' onClick={finalizarDoUsuario}>Finish</button>
                        </div>
                    </div>
                }
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
                <ConfirmPopup
                pt={{
                    footer: {className: 'flex justify-content-center'}
                }}/>
            </div>
            <Dialog
            className='loading-box'
            visible={loadingResults}
            draggable={false}
            closable={false}
            onHide={() => {if (!loadingResults) return; setLoadingResults(() => false);}}>
                <div className='flex flex-column justify-content-center align-items-center'>
                    <ClipLoader color='#F8F8FF' loading={loadingResults} size={150}/>
                    <h2 className='text-center'>Calculating Results...</h2>
                </div>
            </Dialog>
            <Dialog
            className='loading-box'
            visible={!startTest}
            closable={false}
            draggable={false}
            style={{minWidth: '40%', minHeight: '300px', width: 'fit-content', margin: '2%'}}
            onHide={() => {if (startTest) return; setLoading(() => true);}}
            maskStyle={{backgroundColor: 'rgba(0, 0, 0, 1)'}}>
                {
                    loading && 
                    <div className='flex flex-column justify-content-center align-items-center'>
                        <ClipLoader color='#F8F8FF' loading={loading} size={150}/>
                        <h2 className='text-center'>Loading...</h2>
                    </div>
                }
                {
                    !loading && allFine ?
                    (
                        alreadyTaken ?
                        <div>
                            <h1 className='text-center'>Test Done</h1>
                            <Divider/>
                            <div style={{fontSize: 'calc(0.8rem + 1vw)'}}>
                                <p>You've already taken the test this week. Wait at least 7 days to take it again.</p>
                                <p>Here are your last scores.</p>
                            </div>
                            <div className='flex flex-column align-items-center'>
                                <ResultChart resultShow={lastScores}/>
                                <button
                                style={{fontSize: 'calc(0.8rem + 1vw)'}}
                                className='btn btn-primary mt-5'
                                onClick={() => window.location.replace('/')}>
                                    Return to Home Page
                                </button>
                            </div>
                        </div> :
                        <div>
                            <h1 className='text-center'>The Test is about to Start</h1>
                            <Divider/>
                            <div style={{fontSize: 'calc(0.8rem + 1vw)'}}>
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
                                    style={{fontSize: 'calc(0.8rem + 1vw)'}}
                                    className='btn btn-primary w-4'
                                    onClick={() => setStartTest(() => true)}>
                                        Start
                                    </button>
                                    <button
                                    style={{fontSize: 'calc(0.8rem + 1vw)'}}
                                    className='btn btn-primary mt-3 w-4'
                                    onClick={() => window.location.replace('/')}>
                                        Return to Home Page
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) :
                    <div>
                        <Messages ref={(el) => messages = el}/>
                    </div>
                }
            </Dialog>
        </div>
    )
};

const Answer = (props) => {
    const resposta = props.resposta;

    const montarAlternativas = (tpQ) => {
        switch(tpQ){
            case 'multipla_escolha':
                return (
                    <AlternativesM
                    alternativas={resposta.alternativas}
                    handleChangeEscolhaFeita={props.handleChangeEscolhaFeita}/>
                );
            case 'rankeamento':
                return (
                    <AlternativesR
                    idQuestao={resposta.id_questao}
                    alternativas={resposta.alternativas}
                    handleChangeOrdem={props.handleChangeOrdem}/>
                )
            case 'multipla_escolha_com_valores':
                return (
                    <AlternativesMV
                    alternativas={resposta.alternativas}
                    handleChangeEscolhaFeita={props.handleChangeEscolhaFeita}/>
                )
            default:
        };
    };

    return (
        <div className='d-question-box'>
            <div className='mb-4' key={resposta.id_questao}>
                <h3 className='mb-3'>{resposta.enunciado_questao}</h3>
                {montarAlternativas(resposta.tipo_questao)}
            </div>
        </div>
    )
};

const AlternativesM = (props) => {
    return (
        <div>
            {
                props.alternativas.map((alt) => {
                    return (
                        <div className='flex flex-row align-items-center' key={alt.id_alternativa}>
                            <RadioButton
                            id={`rb-${alt.id_questao}:${alt.id_alternativa}`}
                            className='mr-3'
                            checked={alt.escolha_feita}
                            onChange={() => props.handleChangeEscolhaFeita(alt.id_questao, alt.id_alternativa)}/>
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
                props.alternativas.map((alt) => {
                    return (
                        <div className='flex flex-row align-items-center' key={alt.id_alternativa}>
                            <RadioButton
                            className='mr-3'
                            checked={alt.escolha_feita}
                            onChange={() => props.handleChangeEscolhaFeita(alt.id_questao, alt.id_alternativa)}/>
                            <h4>{alt.texto_alternativa}</h4>
                        </div>
                    );
                })
            }
        </div>
    )
};

const AlternativesR = (props) => {
    const onDragEnd = (result) => {
        const {destination, source} = result;

        if(!destination) return;
        if(destination.index === source.index) return;

        const newAlts = [...props.alternativas];
        const alt = newAlts[source.index];
        newAlts.splice(source.index, 1);
        newAlts.splice(destination.index, 0, alt);

        props.handleChangeOrdem(props.idQuestao, newAlts);
    };

    return (
        <div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={`${props.idQuestao}`} direction='vertical'>
                    {
                        (provided) => (
                            <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}>
                                {
                                    props.alternativas.map((alt, index) => {
                                        return (
                                            <AltR
                                            key={alt.id_alternativa}
                                            alt={alt}
                                            index={index}/>
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

const AltR = ({alt, index}) => {
    return (
        <Draggable draggableId={`${alt.id_alternativa}`} index={index}>
            {
                (provided) => (
                    <div
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
}

export default ProficiencyTest;