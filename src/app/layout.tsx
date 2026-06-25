import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: {
    default: 'SSRK Trending Collections | Boutique Fashion',
    template: '%s | SSRK Trending Collections',
  },
  description: 'Shop the latest trending ethnic and fashion collections at SSRK. Exclusive sarees, kurtis, lehengas and more from our Chengalpet boutique.',
  keywords: ['SSRK', 'boutique', 'saree', 'kurti', 'lehenga', 'ethnic wear', 'fashion', 'Chengalpet', 'trending collections'],
  authors: [{ name: 'SSRK Trending Collections' }],
  creator: 'SSRK Trending Collections',
  publisher: 'SSRK Trending Collections',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'SSRK Trending Collections',
    title: 'SSRK Trending Collections | Boutique Fashion',
    description: 'Shop the latest trending ethnic and fashion collections',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SSRK Trending Collections',
    description: 'Shop the latest trending ethnic and fashion collections',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: { google: 'your-google-verification' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#8B1A1A" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#1A0A0A', color: '#fff', border: '1px solid #8B1A1A' },
            duration: 3000,
          }}
        />
      </body>
    </html>
  )
}
