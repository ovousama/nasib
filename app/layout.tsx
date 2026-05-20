import type { Metadata } from 'next'
import { Inter, Noto_Naskh_Arabic, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['200', '300', '400', '500'],
})

const notoArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400', '500'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Naseeb — Seek with sincerity',
  description: 'Naseeb — Seek with sincerity. A free halal matchmaking platform serving Muslims in Canada, the USA, the UK, and the EU. Serious intent, wali involvement, and deep compatibility.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoArabic.variable} ${cormorant.variable}`}>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
