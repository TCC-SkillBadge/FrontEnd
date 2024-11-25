import React from 'react';
import { useTransition, animated } from "react-spring";
import '../styles/Passwords.css';

const PasswordRequirements = ({ show, password }) => {
    const requirements = [
        { requirement: 'At least 8 characters long', test: password.length >= 8 },
        { requirement: 'Contains at least one number', test: /\d/.test(password) },
        { requirement: 'Contains at least one special character', test: /\W/.test(password) },
        { requirement: 'Contains at least one lowercase letter', test: /[a-z]/.test(password) },
        { requirement: 'Contains at least one uppercase letter', test: /[A-Z]/.test(password) }
    ];

    const exibitPasswordRequirements = useTransition(show, {
        from: { opacity: 0, transform: 'scale(0)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        leave: { opacity: 0, transform: 'scale(0)' },
        config: { duration: 300, friction: 10 }
    });

    return (
        exibitPasswordRequirements((style, item) =>
            item &&
            <animated.div style={style} className="flex flex-column">
                <div className='password-requirements'>
                    <div style={{ paddingLeft: '10px' }}>
                        {
                            requirements.map((req, index) => {
                                return (
                                    <div key={index}>
                                        {
                                            req.test ?
                                                <div>
                                                    <span style={{ color: '#8DFD8B' }}>&#10003;</span>
                                                    <span style={{ color: '#8DFD8B', marginLeft: '10px' }}>{req.requirement}</span>
                                                </div> :
                                                <div>
                                                    <span style={{ color: 'red' }}>&#10007;</span>
                                                    <span style={{ color: 'red', marginLeft: '10px' }}>{req.requirement}</span>
                                                </div>
                                        }
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </animated.div>
        )
    )
};

export default PasswordRequirements;
