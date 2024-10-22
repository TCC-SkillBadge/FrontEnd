import React, { useEffect, useState } from 'react';
import Navbar from "../Navbar";
import { Divider } from 'primereact/divider';
import { useLocation } from 'react-router-dom';
import { animated, useSpring } from 'react-spring';
import 'react-toastify/dist/ReactToastify.css';
import Chart from 'react-apexcharts';
import '../../styles/ResultScreen.css';

const ResultScreen = () => {
    const resultShow = useLocation().state;

    useEffect(() => {console.log(resultShow)}, []);

    const transicao = useSpring({
        from: { transform: 'scale(0.5)', boxShadow: '0px 0px 0px rgba(0,0,0,0)' },
        to: { transform: 'scale(1)', boxShadow: '0px 10px 20px rgba(0,0,0,0.3)' },
        config: { tension: 300, friction: 20 },
    });

    return (
        <div>
            <Navbar/>
            <animated.div style={transicao} className='result-box'>
                <h1>Results</h1>
                <Divider/>
                <div className='flex justify-content-center'>
                    <Chart
                    options={{
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
                            text: 'Score by Soft Skill',
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
                        }
                    }}
                    series={resultShow.map((resultado) => resultado.notaShow)}
                    type='polarArea'
                    height={500}/>
                </div>
                <div className='flex justify-content-center mt-3'>
                    <button className='btn btn-primary' onClick={() => window.location.replace('/')}>Back</button>
                </div>
            </animated.div>
        </div>
    )
}

export default ResultScreen;