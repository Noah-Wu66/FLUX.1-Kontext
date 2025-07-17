import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FLUX.1 Kontext AI 绘图应用',
  description: '基于 FLUX.1 Kontext API 的智能图片生成和编辑应用',
  keywords: ['AI绘图', 'FLUX.1', 'Kontext', '图片生成', '人工智能'],
  authors: [{ name: 'AI Drawing App' }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎨</text></svg>",
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 防止用户缩放，提供一致的移动端体验
  viewportFit: 'cover', // 适配有刘海屏的设备
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Header />
          <main className="max-w-7xl mx-auto px-4 pc:px-6 lg:px-8 py-4 pc:py-6 lg:py-8">
            {children}
          </main>

          {/* 页脚 */}
          <footer className="bg-gray-50 border-t border-gray-200 mt-12 pc:mt-16">
            <div className="max-w-7xl mx-auto px-4 pc:px-6 lg:px-8 py-6 pc:py-8">
              <div className="text-center">
                <p className="text-sm pc:text-base text-gray-600">
                  基于 FLUX.1 Kontext API 构建 |
                  <a href="https://fal.ai" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 ml-1">
                    Powered by FAL.ai
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
