import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ColorPicker } from 'primereact/colorpicker';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { confirmPopup } from 'primereact/confirmpopup';
import { animated, useTransition } from 'react-spring';
import { ConfirmDialog } from 'primereact/confirmdialog';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';
import { protectRoute } from '../../utils/general-functions/ProtectRoutes';
import { jwtExpirationHandler } from '../../utils/general-functions/JWTExpirationHandler';
import '../../styles/ListSoftSkills.css';
import '../../styles/GlobalStylings.css';

export const ListSoftSkills = () => {
    const objSSInit = {
        id_soft_skill: 0,
        nome_soft_skill: '',
        descricao_soft_skill: '',
        cor_soft_skill: 'ffffff'
    };

    const [token, _setToken] = useState(sessionStorage.getItem('token'));
    const [userType, _setUserType] = useState(sessionStorage.getItem('tipoUsuario'));
    const [userInfo, _setUserInfo] = useState(JSON.parse(sessionStorage.getItem('userInfo')));
    const [userEmail, _setUserEmail] = useState(userInfo.email_admin);

    const [softSkills, setSoftSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopUp, setShowPopUp] = useState(false);
    const [editing, setEditing] = useState(true);
    const [managedSS, setManagedSS] = useState(objSSInit);
    const [immediate, setImmediate] = useState(false);
    const [error, setError] = useState('');
    const [allFine, setAllFine] = useState(false);

    //Definindo conexão com o back-end
    const generalServicesURL = 'https://ms-softskill.azurewebsites.net';

    //URL Local: http://localhost:6004
    //URL Azure: https://ms-softskill.azurewebsites.net
    //URL Heroku: https://test-softskills-bb1e48ce063a.herokuapp.com

    const connectionSoftSkills = axios.create({
        baseURL: `${generalServicesURL}/softskills`,
        headers: { Authorization: `Bearer ${token}` }
    });
    //-----------------------------------------------------------------------------------

    //Iniciating the page
    useEffect(() => {
        fetchList();
    }, []);

    useEffect(() => {
        editing ? setImmediate(() => true) : setImmediate(() => false);
    }, [editing]);

    const fetchList = async () => {
        await connectionSoftSkills.get('/listar')
        .then((response) => {
            const softSkillList = response.data;
            setSoftSkills(() => softSkillList);
            setAllFine(() => true);
        })
        .catch((error) => {
            const msg = handleRequestError(error);
            console.log(msg);
            setError(() => msg);
        })
        .finally(() => {
            setLoading(() => false);
            setEditing(() => false);
        });
    }

    const transitions = useTransition(softSkills, {
        from: { opacity: 0, transform: 'scale(0)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        leave: { opacity: 0, transform: 'scale(0)' },
        config: {duration: 500},
        immediate
    });

    const doVerifications = () => {
        if(managedSS.nome_soft_skill === '' || managedSS.descricao_soft_skill === '') {
            toast.error('Fill all fields!');
            return false;
        }
        return true;
    };

    const confirmEdit = (e) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to edit this Soft Skill?',
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptClassName: 'dbuttons dbuttons-success',
            rejectClassName: 'dbuttons dbuttons-danger',
            accept: () => editSoftSkill(),
        });
    }

    const editSoftSkill = async () => {
        if(!doVerifications()) return;

        const editing = toast.loading('Editing Soft Skill...');
        connectionSoftSkills.put('/editar', {
            nome_soft_skill: managedSS.nome_soft_skill,
            descricao_soft_skill: managedSS.descricao_soft_skill,
            cor_soft_skill: managedSS.cor_soft_skill,
            email_admin: userEmail
        },
        {
            params: {
                id_soft_skill: managedSS.id_soft_skill,
                tipoUsuario: userType
            }
        })
        .then(() => {
            setSoftSkills(list => list.map(ss => ss.id_soft_skill === managedSS.id_soft_skill ? managedSS : ss));
            setManagedSS(() => objSSInit);
            toast.update(editing, {
                render: 'Soft Skill edited successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
            setEditing(() => false);
            setShowPopUp(() => false);
        })
        .catch((error) => {
            const msg = handleRequestError(error);
            toast.update(editing, {
                render: `${msg}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        });
    }

    const confimrDelete = (e, idSS) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to delete this Soft Skill?',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptClassName: 'dbuttons dbuttons-success',
            rejectClassName: 'dbuttons dbuttons-danger',
            accept: () => deleteSoftSkill(idSS),
        });
    }

    const deleteSoftSkill = async (id) => {
        const deleting = toast.loading('Deleting Soft Skill...');
        connectionSoftSkills.delete('/deletar', {
            params: {
                id_soft_skill: id,
                tipoUsuario: userType
            }
        })
        .then(() => {
            toast.update(deleting, {
                render: 'Soft Skill deleted successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
            setSoftSkills(list => list.filter(ss => ss.id_soft_skill !== id));
        })
        .catch((error) => {
            const msg = handleRequestError(error);
            toast.update(deleting, {
                render: `${msg}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        });
    };

    const registerSoftSkill = async () => {
        if(!doVerifications()) return;

        const registering = toast.loading('Registering Soft Skill...');
        connectionSoftSkills.post('/registrar', {
            nome_soft_skill: managedSS.nome_soft_skill,
            descricao_soft_skill: managedSS.descricao_soft_skill,
            cor_soft_skill: managedSS.cor_soft_skill,
            email_admin: userEmail
        },
        {
            params: { tipoUsuario: userType }
        })
        .then((response) => {
            const createdSS = response.data;
            setSoftSkills(list => {
                const newSS = {
                    ...managedSS,
                    id_soft_skill: createdSS.id_soft_skill
                }
                return [...list, newSS];
            });
            setManagedSS(() => objSSInit);
            toast.update(registering, {
                render: 'Soft Skill registered successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
            setShowPopUp(() => false);
        })
        .catch((error) => {
            const msg = handleRequestError(error);
            toast.update(registering, {
                render: `${msg}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        });
    };

    const handleRequestError = (error) => {
        let msg = '';
        if(error.response){
            msg = error.response.data.message
            if(error.response.data.type === 'TokenExpired') jwtExpirationHandler();
        }
        else if(error.request) msg = 'Error while trying to access server!'
        return msg;
    };

    return (
        <div>
            <div id='softskills-component' className='list-box default-border-image'>
                <h1>Soft Skill List</h1>
                <Divider className='mb-4'/>
                <div>
                    {
                        transitions((style, item) => 
                            item &&
                            <animated.div
                            id={`SSDisplayBox-[${item.nome_soft_skill}]`}
                            style={style}
                            key={item.id_soft_skill}
                            className='list-skill-box'>
                                <div className='flex flex-row mt-1'>
                                    <h3
                                    id={`SSName-[${item.nome_soft_skill}]`}
                                    className='mr-3'
                                    style={{textTransform: 'uppercase'}}>
                                        {item.nome_soft_skill}
                                    </h3>
                                    <div
                                    id={`SSColor-[${item.nome_soft_skill}]`}
                                    style={{
                                        padding: '16px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: `#${item.cor_soft_skill}`
                                    }}/> 
                                </div>
                                <p
                                id={`SSDesc-[${item.nome_soft_skill}]`}
                                className='mt-2'>
                                    {item.descricao_soft_skill}
                                </p>
                                <div className='flex justify-content-center mt-3'>
                                    <button
                                    id={`edit-SS-btn-[${item.nome_soft_skill}]`}
                                    className='dbuttons dbuttons-primary'
                                    onClick={() => {
                                        setShowPopUp(() => true);
                                        setEditing(() => true);
                                        setManagedSS(() => item);
                                    }}
                                    style={{
                                        minWidth: '8rem',
                                        marginRight: '10%'
                                    }}>
                                        <i className='pi pi-pencil mr-1'/> Edit
                                    </button>
                                    <button
                                    id={`delete-SS-btn-[${item.nome_soft_skill}]`}
                                    className='dbuttons dbuttons-danger'
                                    onClick={(e) => confimrDelete(e, item.id_soft_skill)}
                                    style={{
                                        minWidth: '8rem',
                                    }}>
                                        <i className='pi pi-trash mr-1'/> Delete
                                    </button>
                                </div>
                            </animated.div>
                        )
                    }
                    {
                        allFine &&
                        <div className='flex justify-content-center'>
                            <button
                            id='add-SS-btn'
                            className='dbuttons dbuttons-primary pl-4 pr-4'
                            onClick={() => setShowPopUp(() => true)}>
                                <i className='pi pi-plus mr-1'/> Add Soft Skill
                            </button>
                        </div>
                    }
                    <div className='flex justify-content-center'>
                        <ErrorMessage msg={error}/>
                        <Loading show={loading} msg='Loading Soft Skills...'/>
                    </div>
                </div>
            </div>

            <ManageSSBox
            showPopUp={showPopUp}
            setShowPopUp={setShowPopUp}
            editing={editing}
            setEditing={setEditing}
            managedSS={managedSS}
            setManagedSS={setManagedSS}
            confirmEdit={confirmEdit}
            registerSoftSkill={registerSoftSkill}
            objSSInit={objSSInit}/>

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
}

const ManageSSBox = ({
    showPopUp,
    setShowPopUp,
    editing,
    setEditing,
    managedSS,
    setManagedSS,
    confirmEdit,
    registerSoftSkill,
    objSSInit
}) => {
    return (
        <Dialog
        id='manage-SS-box'
        className='manage-box default-border-image'
        closable={false}
        visible={showPopUp}
        onHide={() => {if (!showPopUp) return; setShowPopUp(() => false);}}>
            <h1>{ editing ? 'Edit' : 'Register' } Soft Skill</h1>
            <Divider/>
            <div>
                <div className='grid mt-4'>
                    <div className='xl:col-9 lg:col-8 md:col-12 sm:col-12'>
                        <h4>Name</h4>
                        <InputText
                        id='SS-input-name'
                        className='w-100'
                        value={managedSS.nome_soft_skill}
                        onChange={(e) => {
                            setManagedSS(obj => {
                                return {
                                    ...obj,
                                    nome_soft_skill: e.target.value
                                }
                            })
                        }}/> 
                    </div>
                    <div className='flex xl:col-3 lg:col-4 md:col-12 sm:col-12 align-items-center xl:justify-content-center lg:justify-content-center'>
                        <div className='flex flex-row'>
                            <h4>Color</h4>
                            <ColorPicker
                            id='SS-color-picker'
                            className='ml-3 max-w-4rem'
                            value={managedSS.cor_soft_skill}
                            onChange={e => {
                                setManagedSS(obj => {
                                    return {
                                        ...obj,
                                        cor_soft_skill: e.value
                                    }
                                })
                            }}/> 
                        </div>
                    </div>
                </div>
                <div>
                    <h4>Description</h4>
                    <InputTextarea
                    id='SS-input-desc'
                    className='w-100'
                    value={managedSS.descricao_soft_skill}
                    onChange={(e) => {
                        setManagedSS(obj => {
                            return {
                                ...obj,
                                descricao_soft_skill: e.target.value
                            }
                        })
                    }}/>
                </div>
                <div className='flex flex-row justify-content-center mt-4'>
                    <button
                    id='confirm-manage-SS-btn'
                    className='dbuttons dbuttons-success'
                    onClick={editing ? confirmEdit : registerSoftSkill}
                    style={{
                        minWidth: '8rem',
                        marginRight: '10%'
                    }}>
                        <i className='pi pi-check mr-1'/> { editing ? 'Save' : 'Register' }
                    </button>
                    <button
                    id='cancel-manage-SS-btn'
                    className='dbuttons dbuttons-danger'
                    onClick={() => {
                        setShowPopUp(() => false)
                        setManagedSS(() => objSSInit)
                        if(editing) setEditing(() => false)
                    }}
                    style={{
                        minWidth: '8rem'
                    }}>
                        <i className='pi pi-times mr-1'/> Cancel
                    </button>
                </div>
            </div>
        </Dialog>
    );
}

export default protectRoute(ListSoftSkills);
