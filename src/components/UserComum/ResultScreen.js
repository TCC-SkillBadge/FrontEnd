import React, { useEffect, useState } from 'react';
import { Divider } from 'primereact/divider';
import { useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Chart from 'react-apexcharts';
import { protectRoute } from '../../utils/general-functions/ProtectRoutes';
import '../../styles/ResultScreen.css';
import '../../styles/GlobalStylings.css';

export const ResultScreen = protectRoute(() => {
    const [resultShow, _setResultShow] = useState(useLocation().state);

    useEffect(() => {
        console.log('Result Screen Mounted');
        console.log(resultShow);
        resultShow.map((resultado) => console.log(resultado.nome_soft_skill))
    }
    , []);

    return (
        <div className='result-box default-border-image'>
            <h1>Your Results</h1>
            <Divider/>
            <div className='flex flex-column align-items-center'>
                <ResultChart resultShow={resultShow}/>
            </div>
            <div className='flex flex-row justify-content-center mt-5 mb-3'>
                <button
                id='results-return-home-btn'
                className='dbuttons dbuttons-primary pr-6 pl-6'
                style={{fontSize: 'calc(0.8rem + 1.2vw)'}}
                onClick={() => window.location.replace('/')}>
                    Go Back
                </button>
            </div>
        </div>
    )
});

export const ResultChart = ({resultShow}) => {
    const [series, _setSeries] = useState(resultShow.map((resultado) => resultado.notaShow));
    const [labels, _setLabels] = useState(resultShow.map((resultado) => resultado.nome_soft_skill));
    const [colors, _setColors] = useState(resultShow.map((resultado) => `#${resultado.cor_soft_skill}`));

    const options = {
        chart: {
            toolbar: {
                show: false
            },
        },
        labels,
        legend: {
            show: true,
            position: 'bottom',
            fontSize: '16px',
            labels: {
                colors: 'white'
            }
        },
        colors,
        title: {
            text: 'Score per Soft Skill',
            align: 'center',
            style: {
                fontSize: '20px',
                color: 'white',
            },
            margin: 40
        },
        yaxis: {
            max: 100,
            labels: {
                show: true,
                style: {
                    colors: 'white'
                }
            }
        },
        fill: {
            opacity: 0.8
        },
    };

    return (
        <div id='result-chart' className='flex'>
            <Chart
            options={options}
            series={series}
            type='polarArea'
            height={500}
            width={500}/>
        </div>
    )
};