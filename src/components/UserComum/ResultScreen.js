import React, { useEffect } from 'react';
import Navbar from "../Navbar";
import { Divider } from 'primereact/divider';
import { useLocation } from 'react-router-dom';
import { animated, useSpring } from 'react-spring';
import 'react-toastify/dist/ReactToastify.css';
import Chart from 'react-apexcharts';
import '../../styles/ResultScreen.css';

export const ResultScreen = () => {
    const resultShow = useLocation().state;

    useEffect(() => {console.log(resultShow)}, []);

    const transition = useSpring({
        from: { transform: 'scale(0)', opacity: 1 },
        to: [
        { transform: 'scale(1.2)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
        ],
        config: { duration: 250, friction: 0.5, tension: 200 },  
    });

    return (
        <div>
            <Navbar/>
            <animated.div style={transition} className='result-box'>
                <h1>Results</h1>
                <Divider/>
                <div className='flex justify-content-center'>
                    <ResultChart resultShow={resultShow}/>
                </div>
                <div className='flex justify-content-center mt-3'>
                    <button className='btn btn-primary' onClick={() => window.location.replace('/')}>Voltar</button>
                </div>
            </animated.div>
        </div>
    )
};

export const ResultChart = ({resultShow}) => {
    const options = {
        chart: {
            toolbar: {
                show: false
            },
        },
        labels: resultShow.map((resultado) => resultado.nome_soft_skill),
        legend: {
            show: true,
            position: 'bottom',
            fontSize: '16px',
            labels: {
                colors: 'white'
            }
        },
        colors: resultShow.map((resultado) => `#${resultado.cor_soft_skill}`),
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
        <div className='flex'>
            <Chart
            options={options}
            series={resultShow.map((resultado) => resultado.notaShow)}
            type='polarArea'
            height={500}
            width={500}/>
        </div>
    )
};