import type { Metadata } from 'next'
import './globals.css'
import { SolanaWalletProvider } from '@/components/wallet/WalletProvider'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Token Platform',
  description: 'Buy and sell tokens on the platform',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SolanaWalletProvider>
            {children}
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
