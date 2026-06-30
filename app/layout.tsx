import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/site/theme-provider'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TalentMind AI — The AI Hiring Operating System',
  description:
    'TalentMind AI evaluates candidates semantically with Google Gemini — understanding resumes, comparing them against job descriptions, ranking talent, and explaining every recommendation.',
  keywords: ['AI Recruiting', 'Resume Parser', 'Google Gemini HR Tech', 'Applicant Tracking System', 'Talent Discovery', 'Semantic Resume Ranking', 'AI HR Tool'],
  authors: [{ name: 'Piyush Markandey' }],
  creator: 'Piyush Markandey',
  metadataBase: new URL('https://talentmind-ai-build.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://talentmind-ai-build.vercel.app',
    title: 'TalentMind AI — The AI Hiring Operating System',
    description: 'Turn stacks of resumes into a ranked, explainable shortlist in minutes powered by Google Gemini.',
    siteName: 'TalentMind AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TalentMind AI — The AI Hiring Operating System',
    description: 'Turn stacks of resumes into a ranked, explainable shortlist in minutes powered by Google Gemini.',
    creator: '@piyushmarkandey',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
    { media: '(prefers-color-scheme: light)', color: '#F4F6F8' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

