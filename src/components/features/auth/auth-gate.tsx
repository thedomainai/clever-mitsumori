'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import Button from '@/components/ui/button'
import LoadingSpinner from '@/components/ui/loading-spinner'

// checking: 認証状態の確認中 / signedOut: 未ログイン / denied: ログイン済みだが許可リストに無い
type AuthStatus = 'checking' | 'signedOut' | 'denied' | 'allowed'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  signIn: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/**
 * アクセス可否は Firestore セキュリティルール（許可リスト）が判定する。
 * クライアントでは product_overrides を 1 件読めるかで結果を受け取るだけにし、
 * 許可リストをクライアントに持たない。
 */
async function checkAccess(): Promise<boolean> {
  if (!db) return false
  try {
    await getDocs(query(collection(db, 'product_overrides'), limit(1)))
    return true
  } catch (e) {
    if ((e as { code?: string }).code === 'permission-denied') return false
    throw e
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Firebase 未設定（ローカル開発）のときは認証を求めない。価格の編集もできない状態で動く
  const [status, setStatus] = useState<AuthStatus>(isFirebaseConfigured ? 'checking' : 'allowed')

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) {
        setStatus('signedOut')
        return
      }
      setStatus('checking')
      try {
        setStatus((await checkAccess()) ? 'allowed' : 'denied')
      } catch (e) {
        console.error('アクセス確認に失敗しました:', e)
        setStatus('denied')
      }
    })
  }, [])

  const signIn = useCallback(async () => {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
  }, [])

  const logout = useCallback(async () => {
    if (!auth) return
    await signOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** 許可されたユーザーにだけ children を表示する */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, status, signIn, logout } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (status === 'allowed') return <>{children}</>

  if (status === 'checking') {
    return <LoadingSpinner size="lg" label="認証を確認しています" className="py-24" />
  }

  const handleSignIn = async () => {
    setSigningIn(true)
    setError(null)
    try {
      await signIn()
    } catch (e) {
      const code = (e as { code?: string }).code
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        console.error('ログインに失敗しました:', e)
        setError('ログインに失敗しました。時間をおいて再度お試しください')
      }
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto py-20 text-center">
      {status === 'denied' ? (
        <>
          <h1 className="text-lg font-semibold text-stone-900">アクセス権がありません</h1>
          <p className="mt-3 text-sm text-stone-500 leading-relaxed">
            {user?.email} はこのツールの利用者として登録されていません。
            管理者に登録を依頼するか、別のアカウントでログインしてください。
          </p>
          <Button variant="secondary" className="mt-6" onClick={logout}>
            別のアカウントでログイン
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-lg font-semibold text-stone-900">ログイン</h1>
          <p className="mt-3 text-sm text-stone-500">Google アカウントでログインしてください</p>
          <Button className="mt-6 w-full" loading={signingIn} onClick={handleSignIn}>
            Google でログイン
          </Button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </>
      )}
    </div>
  )
}

/** ヘッダー右端のログイン中ユーザー表示 */
export function UserMenu() {
  const { user, logout } = useAuth()
  if (!user) return null
  return (
    <div className="flex items-center gap-2 pl-3 ml-2 border-l border-stone-200">
      <span className="hidden md:inline text-xs text-stone-500 max-w-[180px] truncate">{user.email}</span>
      <Button variant="ghost" size="sm" onClick={logout}>
        ログアウト
      </Button>
    </div>
  )
}
