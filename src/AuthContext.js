import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { ensureProfile } from './data';
import { auth } from './firebase';
const Ctx=createContext(null);export const useAuth=()=>useContext(Ctx);
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>onAuthStateChanged(auth,async u=>{setUser(u);if(u){try{await ensureProfile(u);}catch(e){console.warn(e.message);}}setLoading(false);}),[]);
 const register=async({name,email,password})=>{const r=await createUserWithEmailAndPassword(auth,email.trim(),password);await updateProfile(r.user,{displayName:name.trim()});await ensureProfile(r.user,name.trim());};
 const login=(email,password)=>signInWithEmailAndPassword(auth,email.trim(),password);
 const resetPassword=email=>sendPasswordResetEmail(auth,email.trim());
 const logout=()=>signOut(auth);
 return <Ctx.Provider value={{user,loading,register,login,resetPassword,logout}}>{children}</Ctx.Provider>;
}
