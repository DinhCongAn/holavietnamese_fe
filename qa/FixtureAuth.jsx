import {createContext,useContext,useState} from 'react';
import {profile} from './fixtures';
const Context=createContext(null);
const guest=new URLSearchParams(location.search).get('role')==='guest';
const learnerOnly=new URLSearchParams(location.search).get('role')==='learner';
export function AuthProvider({children}){const[authenticated,setAuthenticated]=useState(!guest);const avatarMode=new URLSearchParams(location.search).get('avatar');const user=authenticated?{...profile,...(avatarMode==='photo'?{avatarUrl:'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=200&q=80'}:avatarMode==='broken'?{avatarUrl:'/qa/missing-avatar.jpg'}:{}),role:learnerOnly?'LEARNER':profile.role}:null;return <Context.Provider value={{user,isAuthenticated:authenticated,isAdmin:authenticated&&!learnerOnly,isLearner:authenticated,loading:false,hasRole:role=>authenticated&&user?.role===role,fetchProfile:async()=>profile,login:async()=>{setAuthenticated(true);return{success:true,user:profile};},register:async()=>({success:true}),loginWithGoogle:async()=>({success:false,message:'Google không chạy trong môi trường QA.'}),logout:async()=>setAuthenticated(false)}}>{children}</Context.Provider>}
export const useAuth=()=>useContext(Context);
export default Context;
