import {doc,getDoc,setDoc,collection,getDocs,addDoc,serverTimestamp,query,orderBy,limit} from 'firebase/firestore';
import {db} from './firebase';
export async function ensureProfile(user,name){
 const ref=doc(db,'users',user.uid),snap=await getDoc(ref);
 const old=snap.exists()?snap.data():{};
 await setDoc(ref,{uid:user.uid,name:name||old.name||user.displayName||'Aluno FitPro',email:user.email||'',photoURL:user.photoURL||'',createdAt:old.createdAt||serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});
}
export async function readProfile(uid){const s=await getDoc(doc(db,'users',uid));return s.exists()?s.data():null;}
export async function writeProfile(uid,data){return setDoc(doc(db,'users',uid),{...data,updatedAt:serverTimestamp()},{merge:true});}
export async function readProgress(uid){const s=await getDocs(collection(db,'users',uid,'exerciseProgress'));return s.docs.map(d=>({id:d.id,...d.data()}));}
export async function addProgress(uid,data){return addDoc(collection(db,'users',uid,'exerciseProgress'),{...data,createdAt:serverTimestamp()});}
export async function readWorkouts(uid){const q=query(collection(db,'users',uid,'workouts'),orderBy('createdAt','desc'),limit(10));const s=await getDocs(q);return s.docs.map(d=>({id:d.id,...d.data()}));}
export async function addWorkout(uid,data){return addDoc(collection(db,'users',uid,'workouts'),{...data,createdAt:serverTimestamp()});}
