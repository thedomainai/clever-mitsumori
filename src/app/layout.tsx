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
        <title>在庫連動見積抽出ツール</title>
        <meta name="description" content="商品カテゴリのカット品在庫を管理し、条件検索できるツール" />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  在庫連動見積抽出ツール
                </h1>
                <nav className="flex space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        px-4 py-2 rounded-md font-medium text-sm transition-colors
                        ${
                          pathname === item.href
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {children}
          </main>

          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-sm text-gray-500">
                © 2026 在庫連動見積抽出ツール
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
