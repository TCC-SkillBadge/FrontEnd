import React, { useEffect } from 'react'
import '../styles/ErrorMessage.css'

const ErrorMessage = ({msg}) => {
    
    useEffect(() => {
        console.log('Error message')
        console.log(msg)
    }, [])

    return (
        <div className='error-message'>
            <b><i className='pi pi-times-circle'/> Error</b> {msg}
        </div>
    )
}

export default ErrorMessage;
