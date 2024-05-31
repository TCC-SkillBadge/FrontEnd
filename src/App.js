import './App.css'
import 'primeflex/primeflex.css'
import 'primeflex/themes/primeone-dark.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './navbar/Navbar'
import Home from './common-pages/Home'
import Login from './common-pages/Login'
import Cadastro from './common-pages/Cadastro'
import ContaUA from './components/UserAdmin/ContaUA'
import ContaUE from './components/UserEmpresarial/ContaUE'
import ContaUC from './components/UserComum/ContaUC'
import PesquisaEmpr from './components/UserEmpresarial/PesquisaEmpr'
import PesquisaAdmin from './components/UserAdmin/PesquisaAdmin'
import ListarUCs from './components/UserAdmin/ListarUCs'
import ListarUEs from './components/UserAdmin/ListarUEs'
import { useEffect } from 'react'

function App() {

    useEffect(() => {
        refresh()
    }, [])

    const refresh = () => {
        const usuarioEmpresarial = sessionStorage.getItem('usuarioEmpresarial')
        const usuarioComum = sessionStorage.getItem('usuarioComum')
        const usuarioAdmin = sessionStorage.getItem('usuarioAdmin')

        if(usuarioEmpresarial || usuarioComum || usuarioAdmin) document.querySelector('#atividadesGerais').style.display = 'none'
        else document.querySelector('#atividadesGerais').style.display = 'block'

        document.querySelector('#atividadesUA').style.display = usuarioAdmin ? 'block' : 'none'
        document.querySelector('#atividadesUE').style.display = usuarioEmpresarial ? 'block' : 'none'
        document.querySelector('#atividadesUC').style.display = usuarioComum ? 'block' : 'none'
    }

    return (
        <div>
            <Navbar/>
            <Routes>
                <Route exact path='/' element={<Home/>}/>
                <Route path='/login' element={<Login refresh={refresh}/>}/>
                <Route path='/cadastro' element={<Cadastro/>}/>
                <Route path='/contaUE' element={<ContaUE refresh={refresh}/>}/>
                <Route path='/contaUC' element={<ContaUC refresh={refresh}/>}/>
                <Route path='/contaUA' element={<ContaUA refresh={refresh}/>}/>
                <Route path='/pesquisaEmpr' element={<PesquisaEmpr/>}/>
                <Route path='/pesquisaAdmin' element={<PesquisaAdmin/>}/>
                <Route path='/listarUCs' element={<ListarUCs/>}/>
                <Route path='/listarUEs' element={<ListarUEs/>}/>
            </Routes>
        </div>
    );
}

export default App;

