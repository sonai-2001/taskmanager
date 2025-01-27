"use client"
import { darkTheme } from '@/helper/theme'
import { ThemeProvider } from '@emotion/react'
import React from 'react'


const NormalUser = () => {
  return (
   <ThemeProvider theme={darkTheme}>
           <div>NormalUser</div>

   </ThemeProvider>
  )
}

export default NormalUser