"use client"
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { RootState } from '@/redux-toolkit/store/store'; 

interface User {
    id: string;
    email: string;
    display_name: string;
    added_taskable: boolean;
  }

  interface TaskableUser {
     id:string;
    display_name: string;
    email: string;
  }

  interface AppState {
    users: User[]|[];
    taskableUsers: TaskableUser[]|[];
  }
  
   const initialState: AppState = {
    users: [],
    taskableUsers: [],
  };
const adminSlice=createSlice({
name:"admin",
initialState,
reducers:{
       setUsers:(state,action:PayloadAction<User[]>)=>{
               state.users=action.payload
       },
       addTaskableUsers:(state,action:PayloadAction<TaskableUser>)=>{
                state.taskableUsers=[...state.taskableUsers, action.payload]
       },
       setTaskableUser:(state,action:PayloadAction<TaskableUser[]>)=>{
              state.taskableUsers=action.payload
       }
}


})

export const {setUsers,addTaskableUsers,setTaskableUser}=adminSlice.actions;

export default adminSlice.reducer;