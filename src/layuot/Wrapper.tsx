import dynamic from 'next/dynamic'
import React from 'react'
const Header =dynamic(()=>import ("./Header"))

const Warapper = ({children}:{children:React.ReactNode}) => {
  return (
    <div>
        <Header/>
        {children}
    </div>
  )
}

export default Warapper