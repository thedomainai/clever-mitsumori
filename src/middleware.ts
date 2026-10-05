import { NextResponse } from 'next/server'

// 商品データ（仕入値を含む）は静的ファイルとして直接取得させない。
// 取得はログイン確認を挟む /api/products を経由する。
export function middleware() {
  return new NextResponse('Not Found', { status: 404 })
}

export const config = {
  matcher: ['/data/:path*'],
}
