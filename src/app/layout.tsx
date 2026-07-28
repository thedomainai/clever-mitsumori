'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'ホーム' },
    { href: '/search', label: '商品検索' },
    { href: '/overview', label: '全体像' },
  ]

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Clever - EC価格管理</title>
        <meta name="description" content="材質・目開きで商品を検索し、EC販売価格を確認・管理できるツール" />
      </head>
      <body className="bg-canvas antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-stone-200/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 bg-stone-900 rounded-md flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                  </svg>
                </div>
                <span className="text-[15px] font-semibold text-stone-900 tracking-tight">Clever</span>
                <span className="hidden sm:inline text-xs text-stone-400 mt-px">EC価格管理</span>
              </Link>
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
                      ${
                        pathname === item.href
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/60'
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
              {children}
            </div>
          </main>

          <footer className="border-t border-stone-200/70 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
              <p className="text-xs text-stone-400">Clever — EC価格管理ツール</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
