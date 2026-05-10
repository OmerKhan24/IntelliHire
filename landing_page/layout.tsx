import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IntelliHire — AI-Powered Candidate Screening',
  description:
    'IntelliHire automates candidate screening with AI-driven interviews, real-time voice analysis, YOLOv8 proctoring, and instant performance reports. Built at FAST NUCES.',
  keywords: ['AI hiring', 'candidate screening', 'automated interviews', 'HR tech', 'FYP', 'FAST NUCES'],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'IntelliHire — AI-Powered Candidate Screening',
    description: 'From Final Year Project to Real Product. AI interviews, voice analysis & proctoring.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className={`${outfit.variable} ${jakarta.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
