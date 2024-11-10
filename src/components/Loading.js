import React, { useEffect, useState } from 'react'

const Loading = ({show, msg}) => {
  const [display, setDisplay] = useState(
    () => {
      if(show) return 'flex'
      else return 'none'
    }
  )

  useEffect(() => {
    if(show) setDisplay(() => 'flex')
      else setDisplay(() => 'none')
  }, [show])

  return (
    <div
    id='loading-component'
    style={{
      display: display,
      flexDirection: 'column',
      textAlign: 'center',
      height: '100%',
      justifyContent: 'center',
      padding: '5%',
      color: 'white',
    }}>
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