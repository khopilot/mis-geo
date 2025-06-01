import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MIS Geospatial Platform',
  description: 'Advanced geospatial management information system',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50 font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}
