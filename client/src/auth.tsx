import {createContext,useContext,useEffect,useState, type ReactNode} from 'react';
import {api,post} from './api';
import type {User} from './types';
type AuthValue={user:User|null;loading:boolean;refresh:()=>Promise<void>;logout:()=>Promise<void>;setUser:(user:User|null)=>void};
const AuthContext=createContext<AuthValue>({user:null,loading:true,refresh:async()=>{},logout:async()=>{},setUser:()=>{}});
export function AuthProvider({children}:{children:ReactNode}){const [user,setUser]=useState<User|null>(null);const [loading,setLoading]=useState(true);
 const refresh=async()=>{try{const result=await api<{user:User}>('/auth/me');setUser(result.user)}catch{setUser(null)}finally{setLoading(false)}};
 useEffect(()=>{void refresh()},[]);
 const logout=async()=>{try{await post('/auth/logout',{})}finally{setUser(null)}};
 return <AuthContext.Provider value={{user,loading,refresh,logout,setUser}}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);
