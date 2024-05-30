import './App.css'
import 'primeflex/primeflex.css'
import 'primeflex/themes/primeone-dark.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function App() {

    return (
    <BrowserRouter>
        <Navbar/>
        <Routes>
            <Route exact path='/' element={<Home/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/cadastro' element={<Cadastro/>}/>
            <Route path='/contaUE' element={<ContaUE/>}/>
            <Route path='/contaUC' element={<ContaUC/>}/>
            <Route path='/contaUA' element={<ContaUA/>}/>
            <Route path='/pesquisaEmpr' element={<PesquisaEmpr/>}/>
            <Route path='/pesquisaAdmin' element={<PesquisaAdmin/>}/>
            <Route path='/listarUCs' element={<ListarUCs/>}/>
            <Route path='/listarUEs' element={<ListarUEs/>}/>
        </Routes>
    </BrowserRouter>
    );
}

export default App;
