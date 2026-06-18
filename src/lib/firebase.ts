import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ''

export const isFirebaseConfigured = projectId !== ''

let app: FirebaseApp | null = null
let db: Firestore | null = null

if (isFirebaseConfigured) {
  app = getApps().length === 0
    ? initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
      })
    : getApps()[0]
  db = getFirestore(app)
}

export { db }
