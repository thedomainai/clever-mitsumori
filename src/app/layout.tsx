'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'CSV取込' },
    { href: '/search', label: '商品検索' },
  ]

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Clever - 在庫連動見積抽出</title>
        <meta name="description" content="商品カテゴリのカット品在庫を管理し、条件検索できるツール" />
      </head>
      <body className="bg-slate-50 antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                  </svg>
                </div>
                <span className="text-[15px] font-semibold text-slate-900 tracking-tight">Clever</span>
              </div>
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                      ${
                        pathname === item.href
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>

          <footer className="border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <p className="text-center text-xs text-slate-400">
                Clever - 在庫連動見積抽出ツール
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
