import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const REALM = 'Clever'

/** Constant-time string comparison (Edge runtime has no timingSafeEqual) */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function unauthorized(): NextResponse {
  return new NextResponse('認証が必要です', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  })
}

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER
  const password = process.env.BASIC_AUTH_PASSWORD

  // 認証情報が未設定のときは開けない。開発時のみ素通しする
  if (!user || !password) {
    if (process.env.NODE_ENV === 'development') return NextResponse.next()
    return new NextResponse('認証情報が未設定のため利用できません', { status: 503 })
  }

  const header = req.headers.get('authorization')
  if (!header?.startsWith('Basic ')) return unauthorized()

  let decoded: string
  try {
    decoded = atob(header.slice('Basic '.length))
  } catch {
    return unauthorized()
  }

  const sep = decoded.indexOf(':')
  if (sep === -1) return unauthorized()

  const okUser = safeEqual(decoded.slice(0, sep), user)
  const okPassword = safeEqual(decoded.slice(sep + 1), password)
  if (!okUser || !okPassword) return unauthorized()

  return NextResponse.next()
}

// 全リクエストを対象にする。_next/static も除外しない
// （JS バンドルに Firebase の接続情報が含まれるため）
export const config = {
  matcher: ['/:path*'],
}
