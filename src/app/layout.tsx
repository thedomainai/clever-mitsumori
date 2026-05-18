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
      <body className="bg-gray-50">
        <div className="min-h-screen flex flex-col max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="py-4 flex items-center justify-between border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">
              在庫連動見積抽出ツール
            </h1>
            <nav className="flex space-x-2">
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
          </header>

          <main className="flex-1 py-8">
            {children}
          </main>

          <footer className="border-t border-gray-200 py-4">
            <p className="text-center text-sm text-gray-500">
              © 2026 在庫連動見積抽出ツール
            </p>
          </footer>
        </div>
      </body>
    </html>
  )
}
