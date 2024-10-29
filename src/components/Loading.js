import React from 'react'

const Loading = ({msg}) => {
  return (
    <div className='text-center'>
        <i
        className='pi pi-spin pi-spinner'
        style={{
            fontSize: 100,
        }}/>
        <h1 className='mt-1'>{msg}</h1>
    </div>
  )
}

export default Loading;