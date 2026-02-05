import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AppProvider } from '@/lib/AppContext'

export const metadata: Metadata = {
  title: 'CollegePath - Your Personal College Application Advisor',
  description: 'Find your perfect college match with AI-powered recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  )
}