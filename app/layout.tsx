import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'StudyRev — Exam Revision Made Fast',
  description: 'Topic-based notes, practice questions, and timed quizzes for students.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: '100vh', paddingBottom: '60px' }}>
            {children}
          </main>
          <footer style={{
            borderTop: '1px solid var(--border)',
            padding: '20px',
            textAlign: 'center',
            color: 'var(--text3)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
          }}>
            StudyRev — built for students, by students
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}