import React, { useEffect, useState } from 'react'
import '../styles/ErrorMessage.css'

const ErrorMessage = ({msg}) => {
    const [display, setDisplay] = useState(() => {
        if(msg === '' || msg === null) return 'none'
        else return 'block'
    })

    useEffect(() => {
        console.log('Error Message Component Mounted')
        console.log(msg)
    }, [])

    useEffect(() => {
        if(msg === '' || msg === null) setDisplay(() => 'none')
        else setDisplay(() => 'block')
    }, [msg])

    return (
        <div
        id='error-message-component'
        className='error-message'
        style={{
            display: display,
            alignSelf: 'center',
        }}>
            <b><i className='pi pi-times-circle'/> Error</b> {msg}
        </div>
    )
}

export default ErrorMessage;
