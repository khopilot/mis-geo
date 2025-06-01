import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MIS Geospatial Platform',
  description: 'Advanced geospatial management information system',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50 font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}
