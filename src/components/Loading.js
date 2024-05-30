import React, { Component } from 'react'
import { ProgressSpinner } from 'primereact/progressspinner'

export default class Loading extends Component {
  render() {
    return (
        <div className='mr-5 ml-5 mt-5 justify-content-center'>
            <h1 style={{textAlign: 'center'}}>Carregando <ProgressSpinner style={{width: '50px', height: '40px'}}/></h1>
        </div>
    )
  }
}
