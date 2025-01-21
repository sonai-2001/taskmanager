"use client"
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/redux-toolkit/store/store'
// import { CartState } from '@/typescript/interface/cart.interface'

interface userdata{
    id: string,
    display_name: string,
    email: string,
    role: string,
    created_at:string
  
}
interface user{
    user:userdata|null
  
}

const initialState: user = {
    user:null
}
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<userdata>) {
          console.log("the action payload is ",action.payload)
        state.user=action.payload

    }
    
  },
})

        
export const { addUser } = userSlice.actions
export const user = (state: RootState) => state.user

export default userSlice.reducer