import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBCVMOHS3kd06CP1SZnOrMtVFmC-iAw6dA',
  authDomain: 'cyreco-management-dashboard.firebaseapp.com',
  projectId: 'cyreco-management-dashboard',
  storageBucket: 'cyreco-management-dashboard.firebasestorage.app',
  messagingSenderId: '121765511211',
  appId: '1:121765511211:web:cb0f2ad5b0e2030cc82a6e',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
