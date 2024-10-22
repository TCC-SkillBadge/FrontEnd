import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Navbar from "../Navbar";
import { Divider } from 'primereact/divider';
import { Messages } from 'primereact/messages';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClipLoader from "react-spinners/ClipLoader";
import { ColorPicker } from 'primereact/colorpicker';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { confirmPopup } from 'primereact/confirmpopup';
import '../../styles/ListSoftSkills.css';

const baseUrlServicosGerais = axios.create({
    baseURL: 'http://localhost:6004/softskills'
});

export const ListSoftSkills = () => {
    const objSSInit = {
        id_soft_skill: 0,
        nome_soft_skill: '',
        descricao_soft_skill: '',
        cor_soft_skill: 'ffffff'
    };

    const [softSkills, setSoftSkills] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [mostraPopUp, setMostraPopUp] = useState(false);
    const [editando, setEditando] = useState(false);
    const [managedSS, setManagedSS] = useState(objSSInit);

    let messages = useRef(null);

    const token = sessionStorage.getItem('token');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    const userInfo = sessionStorage.getItem('userInfo');

    useEffect(() => {
        if(!token || !tipoUsuario || !userInfo) {
            toast.error('User not authenticated! You will not be able to proceed until you authenticate.');
        }

        pegaLista();
    }, []);

    const pegaLista = async () => {
        await baseUrlServicosGerais.get('/listar', 
            { 
                headers: { Authorization: `Bearer ${token}` }, 
                params: { tipoUsuario }
            }
        )
        .then((response) => {
            setSoftSkills(response.data);
        })
        .catch((error) => {
            let msg
            if(error.response) 
                msg = error.response.data.message
            else if(error.request) 
                msg = 'Error trying to access the server'

            messages.replace({
                severity: 'error',
                summary: 'Erro',
                detail: `${msg}`,
                sticky: true,
                closable: false
            });
        })
        .finally(() => {
            setCarregando(false);
        });
    }

    const confirmarEdicao = (e) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to edit this Soft Skill?',
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => editarSoftSkill(),
        });
    }

    const editarSoftSkill = async () => {
        if(managedSS.nome_soft_skill === '' || managedSS.descricao_soft_skill === '') {
            toast.error('Please fill in all fields!');
            return;
        }

        console.log(managedSS);

        const editando = toast.loading('Editing Soft Skill...');
        baseUrlServicosGerais.put('/editar', {
            nome_soft_skill: managedSS.nome_soft_skill,
            descricao_soft_skill: managedSS.descricao_soft_skill,
            cor_soft_skill: managedSS.cor_soft_skill
        },
        {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                id_soft_skill: managedSS.id_soft_skill,
                tipoUsuario
            }
        })
        .then(() => {
            setMostraPopUp(false);
            setEditando(false);
            setManagedSS(objSSInit);
            toast.update(editando, {
                render: 'Soft Skill edited successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
            pegaLista();
        })
        .catch((error) => {
            let msg
            if(error.response) 
                msg = error.response.data.message
            else if(error.request) 
                msg = 'Error trying to access the server'
            toast.update(editando, {
                render: `${msg}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        });
    }

    const confirmarDelecao = (e, idSS) => {
        confirmPopup({
            target: e.currentTarget,
            message: 'Do you really want to delete this Soft Skill?',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => deletarSoftSkill(idSS),
        });
    }

    const deletarSoftSkill = async (id) => {
        const deletando = toast.loading('Deleting Soft Skill...');
        baseUrlServicosGerais.delete('/deletar', {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                id_soft_skill: id,
                tipoUsuario
            }
        })
        .then(() => {
            toast.update(deletando, {
                render: 'Soft Skill deleted successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
            pegaLista();
        })
        .catch((error) => {
            let msg
            if(error.response) 
                msg = error.response.data.message
            else if(error.request) 
                msg = 'Error trying to access the server'
            toast.update(deletando, {
                render: `${msg}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        });
    };

    const registrarSoftSkill = async () => {
        if(managedSS.nome_soft_skill === '' || managedSS.descricao_soft_skill === '') {
            toast.error('Please fill in all fields!');
            return;
        }

        const { email_admin } = JSON.parse(userInfo);

        const registrando = toast.loading('Registering Soft Skill...');
        baseUrlServicosGerais.post('/registrar', {
            nome_soft_skill: managedSS.nome_soft_skill,
            descricao_soft_skill: managedSS.descricao_soft_skill,
            cor_soft_skill: managedSS.cor_soft_skill,
            email_admin
        },
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { tipoUsuario }
        })
        .then(() => {
            setMostraPopUp(false);
            setManagedSS(objSSInit);
            toast.update(registrando, {
                render: 'Soft Skill registered successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
            pegaLista();
        })
        .catch((error) => {
            let msg
            if(error.response) 
                msg = error.response.data.message
            else if(error.request) 
                msg = 'Error trying to access the server'
            toast.update(registrando, {
                render: `${msg}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        });
    };

    return (
        <div>
            <Navbar/>
            <div className='list-box'>
                <h1>Soft Skills List</h1>
                <Divider className='mb-4'/>
                <div>
                    <div>
                        {softSkills.map((softSkill) => (
                            <div key={softSkill.id_soft_skill} className='list-skill-box'>
                                <div className='grid justify-content-between pt-3 pl-1 xl:mb-0 lg:mb-0 md:mb-3 sm:mb-3'>
                                    <h3 
                                    className='xl:col-8 lg:col-8 md:col-12 sm:col-12'
                                    style={{textTransform: 'uppercase'}}>
                                        {softSkill.nome_soft_skill}
                                    </h3>
                                    <div className='flex flex-row align-items-center mr-4 pl-2'>
                                        <h4>Color:</h4>
                                        <div
                                        style={{
                                            backgroundColor: `#${softSkill.cor_soft_skill}`,
                                            color: `#${softSkill.cor_soft_skill}`,
                                            borderRadius: '8px',
                                            padding: '5%',
                                            marginLeft: '8%'
                                        }}>
                                            00000
                                        </div>
                                    </div>  
                                </div>
                                <p>{softSkill.descricao_soft_skill}</p>
                                <div className='flex justify-content-center'>
                                    <button
                                    className='btn btn-primary'
                                    onClick={() => {
                                        setMostraPopUp(true);
                                        setEditando(true);
                                        setManagedSS(softSkill);
                                    }}>
                                        Edit
                                    </button>
                                    <button
                                    className='btn btn-danger'
                                    onClick={(e) => confirmarDelecao(e, softSkill.id_soft_skill)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {
                        !carregando &&
                        <div className='flex justify-content-center'>
                            <button
                            className='btn btn-success pl-4 pr-4'
                            onClick={() => setMostraPopUp(true)}>
                                <i className='pi pi-plus'/> Soft Skill
                            </button>
                        </div>
                    }
                    <div className='flex justify-content-center'>
                        <Messages ref={(el) => messages = el}/>
                        <ClipLoader color='#F8F8FF' loading={carregando} size={100}/>
                    </div>
                </div>
            </div>
            <Dialog
            className='edit-box'
            closable={false}
            visible={mostraPopUp}
            onHide={() => {if (!mostraPopUp) return; setMostraPopUp(false);}}>
                <h1>{ editando ? 'Editar' : 'Registrar' } Soft Skill</h1>
                <Divider/>
                <div>
                    <div className='grid mt-4'>
                        <div className='xl:col-9 lg:col-8 md:col-12 sm:col-12'>
                           <h4>Name</h4>
                            <InputText
                            className='w-100'
                            value={managedSS.nome_soft_skill}
                            onChange={(e) => {
                                setManagedSS({
                                    ...managedSS,
                                    nome_soft_skill: e.target.value
                                })
                            }}/> 
                        </div>
                        <div className='flex xl:col-3 lg:col-4 md:col-12 sm:col-12 align-items-center xl:justify-content-center lg:justify-content-center'>
                            <div className='flex flex-row'>
                               <h4>Color</h4>
                                <ColorPicker
                                className='ml-3 max-w-4rem'
                                value={managedSS.cor_soft_skill}
                                onChange={e => {
                                    setManagedSS({
                                        ...managedSS,
                                        cor_soft_skill: e.value
                                    })
                                }}/> 
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4>Description</h4>
                        <InputTextarea
                        className='w-100'
                        value={managedSS.descricao_soft_skill}
                        onChange={(e) => {
                            setManagedSS({
                                ...managedSS,
                                descricao_soft_skill: e.target.value
                            })
                        }}/>
                    </div>
                    <div className='flex justify-content-center mt-4'>
                        <button
                        className='btn btn-success'
                        onClick={editando ? confirmarEdicao : registrarSoftSkill}>
                            { editando ? 'Salvar' : 'Registrar' }
                        </button>
                        <button
                        className='btn btn-danger'
                        onClick={() => {
                            setMostraPopUp(false)
                            setManagedSS(objSSInit)
                            if(editando) setEditando(false)
                        }}>
                            Cancel
                        </button>
                    </div>
                </div>
            </Dialog>
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
    );
}

export default ListSoftSkills;
