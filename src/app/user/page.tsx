
"use client"
import { useAppSelector } from '@/hooks/redux/page'
import React from 'react'

const User = () => {
  
  const {user}=useAppSelector(state=>state.user)
  console.log("the user data is ",user)
  
  return (
    <div>User name is {user?.display_name}</div>
  )
}

export default User