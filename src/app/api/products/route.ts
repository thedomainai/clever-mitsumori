import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse, type NextRequest } from 'next/server'

// 仕入値を含む商品データ（public/data/unified.json）をログイン済みの利用者にだけ返す。
// 静的ファイルとしての直接取得は middleware で拒否している。
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'unified.json')

/**
 * 利用可否は Firestore セキュリティルール（clever テナント + 許可リスト）に判定させる。
 * 利用者の ID トークンで product_overrides を 1 件読めれば許可されている。
 * サーバー側に許可リストや資格情報を持たないため、判定がルールと食い違わない。
 */
async function isAllowed(idToken: string): Promise<boolean> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!projectId) return false
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/product_overrides?pageSize=1`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
    cache: 'no-store',
  })
  return res.ok
}

export async function GET(req: NextRequest) {
  const firebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  // Firebase 未設定のローカル開発と、認証の一時無効化（NEXT_PUBLIC_AUTH_DISABLED）のときは素通しする
  const skipAuth =
    (!firebaseConfigured && process.env.NODE_ENV === 'development') ||
    process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

  if (!skipAuth) {
    const header = req.headers.get('authorization')
    if (!header?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }
    if (!(await isAllowed(header.slice('Bearer '.length)))) {
      return NextResponse.json({ error: 'アクセス権がありません' }, { status: 403 })
    }
  }

  const body = await readFile(DATA_PATH, 'utf-8')
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  })
}
