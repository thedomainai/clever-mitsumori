'use client'

import { createContext, FormEvent, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { auth, db, isAuthDisabled, isFirebaseConfigured } from '@/lib/firebase'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import LoadingSpinner from '@/components/ui/loading-spinner'

// checking: 認証状態の確認中 / signedOut: 未ログイン / denied: ログイン済みだが許可リストに無い
type AuthStatus = 'checking' | 'signedOut' | 'denied' | 'allowed'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  signIn: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  sendPasswordSetup: (email: string) => Promise<void>
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
  // Firebase 未設定（ローカル開発）と認証の一時無効化のときは、ログインを求めない
  const [status, setStatus] = useState<AuthStatus>(
    isFirebaseConfigured && !isAuthDisabled ? 'checking' : 'allowed',
  )

  useEffect(() => {
    if (!auth || isAuthDisabled) return
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

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) return
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  // 初回のパスワード設定と、忘れたときの再設定を同じメールで行う
  const sendPasswordSetup = useCallback(async (email: string) => {
    if (!auth) return
    await sendPasswordResetEmail(auth, email)
  }, [])

  const logout = useCallback(async () => {
    if (!auth) return
    await signOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, signIn, signInWithEmail, sendPasswordSetup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** 許可されたユーザーにだけ children を表示する */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, status, signIn, signInWithEmail, sendPasswordSetup, logout } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setSigningIn(true)
    setError(null)
    setNotice(null)
    try {
      await signInWithEmail(email.trim(), password)
    } catch (e) {
      const code = (e as { code?: string }).code
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('メールアドレスまたはパスワードが違います')
      } else if (code === 'auth/too-many-requests') {
        setError('試行回数が多すぎます。しばらく待ってから再度お試しください')
      } else {
        console.error('ログインに失敗しました:', e)
        setError('ログインに失敗しました。時間をおいて再度お試しください')
      }
    } finally {
      setSigningIn(false)
    }
  }

  const handlePasswordSetup = async () => {
    setError(null)
    setNotice(null)
    if (!email.trim()) {
      setError('メールアドレスを入力してから押してください')
      return
    }
    try {
      await sendPasswordSetup(email.trim())
    } catch (e) {
      // 登録の有無を外部に漏らさないよう、失敗しても同じ案内を出す
      console.error('パスワード設定メールの送信に失敗しました:', e)
    }
    setNotice('登録済みのメールアドレスであれば、パスワード設定用のメールを送信しました')
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
          <form onSubmit={handleEmailSignIn} className="mt-6 space-y-3 text-left">
            <Input
              label="メールアドレス"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="パスワード"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={signingIn}>
              ログイン
            </Button>
          </form>
          <button
            type="button"
            onClick={handlePasswordSetup}
            className="mt-3 text-xs text-stone-500 underline underline-offset-2 hover:text-stone-900"
          >
            初めての方・パスワードを忘れた方（設定用メールを送信）
          </button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {notice && <p className="mt-4 text-sm text-stone-600">{notice}</p>}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <Button variant="secondary" className="w-full" disabled={signingIn} onClick={handleSignIn}>
              Google アカウントでログイン
            </Button>
          </div>
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
