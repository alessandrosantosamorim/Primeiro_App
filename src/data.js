
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';

import { db } from './firebase';

// ========================================
// PERFIL
// ========================================

export async function ensureProfile(user, name) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  const old = snap.exists() ? snap.data() : {};

  await setDoc(
    ref,
    {
      uid: user.uid,
      name: name || old.name || user.displayName || 'Aluno FitPro',
      email: user.email || '',
      photoURL: user.photoURL || '',
      createdAt: old.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function readProfile(uid) {
  const s = await getDoc(doc(db, 'users', uid));

  return s.exists() ? s.data() : null;
}

export async function writeProfile(uid, data) {
  return setDoc(
    doc(db, 'users', uid),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ========================================
// PROGRESSO
// ========================================

export async function readProgress(uid) {
  const s = await getDocs(
    collection(db, 'users', uid, 'exerciseProgress')
  );

  return s.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function addProgress(uid, data) {
  return addDoc(
    collection(db, 'users', uid, 'exerciseProgress'),
    {
      ...data,
      createdAt: serverTimestamp(),
    }
  );
}

// ========================================
// HISTÓRICO DE TREINOS
// ========================================

export async function readWorkouts(uid) {
  const q = query(
    collection(db, 'users', uid, 'workouts'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  const s = await getDocs(q);

  return s.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function addWorkout(uid, data) {
  return addDoc(
    collection(db, 'users', uid, 'workouts'),
    {
      ...data,
      createdAt: serverTimestamp(),
    }
  );
}

// ========================================
// TREINOS PERSONALIZADOS
// ========================================

export async function readWorkoutPlans(uid) {
  const q = query(
    collection(db, 'users', uid, 'workoutPlans'),
    orderBy('createdAt', 'desc')
  );

  const s = await getDocs(q);

  return s.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function addWorkoutPlan(uid, data) {
  return addDoc(
    collection(db, 'users', uid, 'workoutPlans'),
    {
      name: data.name,
      exercises: data.exercises,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );
}

export async function updateWorkoutPlan(uid, planId, data) {
  return setDoc(
    doc(db, 'users', uid, 'workoutPlans', planId),
    {
      name: data.name,
      exercises: data.exercises,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteWorkoutPlan(uid, planId) {
  return deleteDoc(
    doc(db, 'users', uid, 'workoutPlans', planId)
  );
}
