import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { protectRoute } from '../utils/general-functions/ProtectRoutes';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { shuffleArray } from '../utils/general-functions/shuffleArray';
import '../styles/GeneralSearch.css';
import '../styles/GlobalStylings.css';

const commonUserURL = 'http://localhost:7000/api';
const enterpriseUserURL = 'http://localhost:7003/api';
const badgeURL = 'http://localhost:7001/badges';

const connectionCommonUser = axios.create({
  baseURL: commonUserURL,
});

const connectionEnterpriseUser = axios.create({
  baseURL: enterpriseUserURL,
});

const connectionBadge = axios.create({
    baseURL: badgeURL,
});

export const GeneralSearch = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [token, _setToken] = useState(sessionStorage.getItem('token'));
    const [userInfo, _setUserInfo] = useState(JSON.parse(sessionStorage.getItem('userInfo')));
    const [userEmail, _setUserEmail] = useState(userInfo.email ? userInfo.email : userInfo.email_comercial);

    const [search, setSearch] = useState(location.state);
    const [searchAux, setSearchAux] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        console.log("GeneralSearch: ", search);
    }, []);

    useEffect(() => {
        setSearch(() => location.state);
    }, [location]);

    useEffect(() => {
        setSearchAux(() => search);
        if(search !== '') searchFor();
    }, [search]);

    const searchFor = async () => {
        setResults(() => []);

        //Encontrando os usuários comuns e empresariais
        setSearching(() => true);
        let UCResponse = [], UEResponse = [];
        try{
            UCResponse = (await connectionCommonUser.get('/find-users', {
                headers: { Authorization: `Bearer ${token}` },
                params: { 
                    search,
                    researcher: userEmail,
                },
            })).data;
            UEResponse = (await connectionEnterpriseUser.get('/find-users', {
                headers: { Authorization: `Bearer ${token}` },
                params: { 
                  search,
                  researcher: userEmail,
                },
            })).data;
        }
        catch(err){
            console.log("Error: ", err);
        }
        //-----------------------------------------------------

        //Encontrando os badges
        let badgeResponseAux = [];
        try{
            badgeResponseAux = (await connectionBadge.get('/consult-general', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search,
                    researcher: userEmail,
                },
            })).data;
        }
        catch(err){
            console.log("Error: ", err);
        }

        console.log("BadgeResponseAux: ", badgeResponseAux);

        const badgeResponse = [];
        for(let i = 0; i < badgeResponseAux.length; i++){
            let razao_social;
            try{
                razao_social = (await connectionEnterpriseUser.get('/find-users', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { 
                      search: badgeResponseAux[i].institution,
                      researcher: userEmail,
                    },
                })).data[0].razao_social;
            }
            catch(err){
                console.log("Error: ", err);
            }
            console.log("Razao Social: ", razao_social);
            const obj = {
                ...badgeResponseAux[i],
                razao_social,
            };
            badgeResponse.push(obj);
        }
        //-----------------------------------------------------

        console.log("BadgeResponse: ", badgeResponse);

        const resultsAux = [...UCResponse, ...UEResponse, ...badgeResponse];

        console.log("ResultsAux: ", resultsAux);

        const results = shuffleArray(resultsAux);

        console.log("Results: ", results);

        setResults(() => results);
        setSearching(() => false);
    };

    const buildResults = () => {
        return results.map((result) => {
            if(result.email){
                const encodedEmail = btoa(result.email);
                return (
                    <div className='general-results-container' key={result.email}>
                        <div className='flex flex-row align-items-center mb-3'>
                            <img
                            src={result.imageUrl ? result.imageUrl : '/default-avatar.png'}
                            alt='User'
                            className='general-search-user-image'
                            width={45}
                            height={45}/>
                            <h1>{result.username ? result.username : 'Username'}</h1>
                        </div>
                        <div className='flex flex-row'>
                            <h5><b className='green-lines'>About:</b></h5>
                            <h5 className='flex-1'>{result.about ? result.about : 'Visit Profile to Learn More about this Company'}</h5>
                        </div>
                        <div className='flex flex-row justify-content-center mt-3'>
                            <Link
                            className='redirect-link'
                            to={`http://localhost:3000/public-profile/${encodedEmail}`}
                            target="_blank"
                            rel="noopener noreferrer">
                                View Profile
                            </Link>
                        </div>
                    </div>
                );
            }
            else if(result.email_comercial){
                const encodedEmail = btoa(result.email_comercial);
                return (
                    <div className='general-results-container' key={result.email_comercial}>
                        <div className='flex flex-row align-items-center mb-3'>
                            <img
                            src={result.imageUrl ? result.imageUrl : '/default-avatar.png'}
                            alt='User'
                            className='general-search-user-image'
                            width={45}
                            height={45}/>
                            <h1>{result.username ? result.username : 'Username'}</h1>
                        </div>
                        <div className='flex flex-row'>
                            <h5><b className='green-lines'>About:</b></h5>
                            <h5 className='flex-1'>{result.sobre ? result.sobre : 'Visit Profile to Learn More about this Company'}</h5>
                        </div>
                        <div className='flex flex-row justify-content-center mt-3'>
                            <Link
                            className='redirect-link'
                            to={`http://localhost:3000/public-profile-enterprise/${encodedEmail}`}
                            target="_blank"
                            rel="noopener noreferrer">
                                View Profile
                            </Link>
                        </div>
                    </div>
                );
            }
            else if(result.id_badge){
                return (
                    <div className='general-search-badge-results-container' key={result.id_badge}>
                        <img
                        src={result.image_url}
                        alt='Badge'
                        className='general-search-badge-image'
                        width={400}
                        height={400}/>
                        <h1>{result.name_badge ? result.name_badge : 'Badge Name'}</h1>
                        <div className='flex flex-row justify-content-center mt-3'>
                        <Link
                        className='redirect-link'
                        to={`http://localhost:3000/badge-public-display/${result.id_badge}/${result.razao_social}`}
                        target="_blank"
                        rel="noopener noreferrer">
                            View Details
                        </Link>
                    </div>
                    </div>
                );
            }
        });
    };

    const handleSearch = () => {
        navigate('/general-search', { state: searchAux });
    };

    return (
        <div className='general-search-container default-border-image'>
            <div className='p-inputgroup'>
                <span className='p-inputgroup-addon general-search-term-span'>
                    Search Term
                </span>
                <InputText
                id='general-search-term'
                value={searchAux}
                onChange={e => setSearchAux(e.target.value)}
                onKeyDown={e => { if(e.key === 'Enter') handleSearch(); }}
                style={{
                    borderRadius: '0px',
                    fontSize: 'calc(1rem + 0.5vw)',
                }}/>
                <Button
                className='general-search-page-btn'
                icon='pi pi-search'
                onClick={handleSearch}/>
            </div>
            <Loading show={searching} msg='Loading Search'/>
            {
                !searching && results.length === 0 ?
                <div className='flex flex-row justify-content-center'>
                    <h1 className='green-lines p-4'>No Results Found</h1>
                </div> :
                null
            }
            <div>
                { buildResults() }
            </div>
        </div>
    )
}

export default protectRoute(GeneralSearch);
